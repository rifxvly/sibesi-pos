"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ScanLine, ShieldCheck, ShieldX, AlertTriangle, Zap, RotateCcw } from "lucide-react";

type DetectionResult = {
  nominal: number;
  confidence: number;
  status: "ASLI" | "DIRAGUKAN" | "PALSU";
  details: {
    warna: string;
    tekstur: string;
    fiturKeamanan: string;
  };
};

export function MoneyDetector({ onDetectionComplete }: { onDetectionComplete?: (result: DetectionResult) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current && !captured) {
      const v = videoRef.current;
      v.srcObject = streamRef.current;
      v.play().catch(() => {});
    }
  }, [cameraActive, captured]);

  async function startCamera() {
    setCameraError(null);
    setError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
      }
      streamRef.current = stream;
      setCaptured(null);
      setResult(null);
      setError(null);
      setCameraActive(true);
    } catch {
      setCameraError("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.");
    }
  }

  function stopCamera() {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setCaptured(null);
    setResult(null);
    setProgress(0);
    setError(null);
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    ctx.drawImage(v, 0, 0);
    
    const imageBase64 = c.toDataURL("image/jpeg", 0.92);
    setCaptured(imageBase64);
    setAnalyzing(true);
    setResult(null);
    setError(null);
    setProgress(0);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 90) {
        p = 90;
        clearInterval(iv);
      }
      setProgress(Math.min(p, 90));
    }, 100);

    try {
      const response = await fetch("/api/money-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      clearInterval(iv);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || errorData?.detail || "Gagal menganalisis uang";
        throw new Error(`${errorMsg}`);
      }

      const detectionResult: DetectionResult = await response.json();
      setResult(detectionResult);
      
      if (onDetectionComplete) {
        onDetectionComplete(detectionResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat analisis");
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setCaptured(null);
    setResult(null);
    setProgress(0);
    setAnalyzing(false);
    setError(null);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASLI": return "text-emerald-600";
      case "DIRAGUKAN": return "text-amber-600";
      case "PALSU": return "text-red-600";
      default: return "text-stone-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "ASLI": return "bg-emerald-50 border-emerald-300";
      case "DIRAGUKAN": return "bg-amber-50 border-amber-300";
      case "PALSU": return "bg-red-50 border-red-300";
      default: return "bg-stone-50 border-stone-300";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ASLI": return "bg-emerald-200 text-emerald-800";
      case "DIRAGUKAN": return "bg-amber-200 text-amber-800";
      case "PALSU": return "bg-red-200 text-red-800";
      default: return "bg-stone-200 text-stone-800";
    }
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 70) return "bg-emerald-500";
    if (confidence >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Deteksi Uang Palsu (AI)</p>
            <p className="text-xs text-amber-700">AI akan otomatis mendeteksi nominal dan keaslian</p>
          </div>
        </div>
        {cameraActive && (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
          </span>
        )}
      </div>

      {/* Camera Section */}
      <div className="space-y-3">
        {!cameraActive ? (
          <button onClick={startCamera} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-white py-5 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition">
            <Camera className="h-5 w-5" /> Buka Kamera & Scan Uang
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border-2 border-amber-300 bg-black">
              {!captured ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
                    <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl" />
                    <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr" />
                    <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl" />
                    <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br" />
                    <p className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-white/70">Posisikan uang di bingkai</p>
                  </div>
                </>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={captured} alt="Captured" className="w-full h-48 object-cover" />
                  {analyzing && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" style={{ top: `${progress}%` }} />
                      <ScanLine className="h-8 w-8 text-amber-400 animate-pulse" />
                      <p className="text-xs font-bold text-white">AI Menganalisis... {Math.round(progress)}%</p>
                      <div className="w-32 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2">
              {!captured ? (
                <button onClick={capture} disabled={analyzing} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition disabled:opacity-50">
                  <ScanLine className="h-4 w-4" /> Scan Uang
                </button>
              ) : !analyzing ? (
                <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition">
                  <RotateCcw className="h-4 w-4" /> Scan Ulang
                </button>
              ) : null}
              <button onClick={stopCamera} className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition">
                <CameraOff className="h-3.5 w-3.5" /> Tutup
              </button>
            </div>

            {error && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
                <button onClick={reset} className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition">
                  <RotateCcw className="h-4 w-4" /> Coba Lagi
                </button>
              </div>
            )}

            {result && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* Result Card */}
                <div className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${getStatusBg(result.status)}`}>
                  {result.status === "ASLI" ? (
                    <ShieldCheck className="h-10 w-10 shrink-0 text-emerald-500" />
                  ) : result.status === "DIRAGUKAN" ? (
                    <AlertTriangle className="h-10 w-10 shrink-0 text-amber-500" />
                  ) : (
                    <ShieldX className="h-10 w-10 shrink-0 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className={`text-base font-bold ${getStatusColor(result.status)}`}>
                      {result.status === "ASLI" ? "UANG ASLI TERVERIFIKASI" : result.status === "DIRAGUKAN" ? "PERINGATAN! DIRAGUKAN" : "PERINGATAN! Dicurigai Palsu"}
                    </p>
                    <p className="text-sm font-semibold">Nominal Terdeteksi: Rp {result.nominal.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadge(result.status)}`}>
                      {result.status}
                    </span>
                    <p className={`mt-1 text-[10px] font-bold ${getStatusColor(result.status)}`}>{result.confidence}%</p>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-800">Tingkat Keaslian</span>
                    <span className={`font-bold ${getConfidenceBarColor(result.confidence) === "bg-emerald-500" ? "text-emerald-600" : getConfidenceBarColor(result.confidence) === "bg-amber-500" ? "text-amber-600" : "text-red-600"}`}>{result.confidence}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/50 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getConfidenceBarColor(result.confidence)}`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Detail Analysis */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-lg border border-amber-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-medium text-amber-600 uppercase">Analisis Warna</p>
                    <p className="text-xs font-semibold text-amber-900">{result.details.warna}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-medium text-amber-600 uppercase">Analisis Tekstur</p>
                    <p className="text-xs font-semibold text-amber-900">{result.details.tekstur}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-medium text-amber-600 uppercase">Fitur Keamanan</p>
                    <p className="text-xs font-semibold text-amber-900">{result.details.fiturKeamanan}</p>
                  </div>
                </div>

                {/* Status Info */}
                {result.status !== "ASLI" && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    <span className="font-bold">PENTING:</span> Transaksi tidak dapat dilanjutkan sampai uang diverifikasi ASLI. Silakan scan ulang atau gunakan uang lain.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {cameraError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs text-red-700">{cameraError}</p>
        </div>
      )}
    </div>
  );
}
