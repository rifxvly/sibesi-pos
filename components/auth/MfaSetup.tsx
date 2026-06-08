"use client";

import { useState, useEffect } from "react";
import { Lock, ShieldCheck, Copy, CheckCircle2 } from "lucide-react";

export function MfaSetup() {
  const [loading, setLoading] = useState(false);
  const [mfaData, setMfaData] = useState<{ secret: string; otpAuthUrl: string } | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [mfaAlreadyActive, setMfaAlreadyActive] = useState(false);

  useEffect(() => {
    fetch("/api/auth/mfa/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.mfaEnabled) {
          setMfaAlreadyActive(true);
        }
      })
      .catch(console.error)
      .finally(() => setIsChecking(false));
  }, []);

  async function handleEnableMfa() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengaktifkan MFA");
        return;
      }
      setMfaData(data);
      setMfaEnabled(true);
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setVerifyResult(null);
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verifyToken })
      });
      const data = await res.json();
      if (data.valid) {
        setVerifyResult("success");
      } else {
        setVerifyResult("failed");
      }
    } catch {
      setVerifyResult("failed");
    }
  }

  function handleCopySecret() {
    if (mfaData?.secret) {
      navigator.clipboard.writeText(mfaData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (mfaEnabled && mfaData) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <h4 className="font-bold text-emerald-700 text-sm">MFA Berhasil Diaktifkan!</h4>
        </div>

        <div className="w-full max-w-[280px] space-y-4">
          {/* QR Code placeholder with otpauth URI */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
            <div className="w-40 h-40 mx-auto bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-center mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mfaData.otpAuthUrl)}`}
                alt="QR Code MFA"
                className="w-36 h-36 rounded"
              />
            </div>
            <p className="text-[10px] text-stone-400">Scan QR di atas dengan Google Authenticator</p>
          </div>

          {/* Secret key manual entry */}
          <div>
            <p className="text-xs font-bold text-stone-600 mb-1.5">Atau masukkan secret key secara manual:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-mono text-stone-900 break-all select-all">
                {mfaData.secret}
              </code>
              <button
                onClick={handleCopySecret}
                className="shrink-0 rounded-lg border border-stone-200 p-2 hover:bg-stone-50 transition"
                title="Copy"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-stone-500" />}
              </button>
            </div>
          </div>

          {/* Verify OTP */}
          <div>
            <p className="text-xs font-bold text-stone-600 mb-1.5">Verifikasi kode OTP:</p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 digit kode"
                className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm text-center font-mono font-bold tracking-[0.3em] focus:border-stone-400 focus:outline-none"
              />
              <button
                onClick={handleVerify}
                disabled={verifyToken.length !== 6}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50 transition"
              >
                Verify
              </button>
            </div>
            {verifyResult === "success" && (
              <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> OTP valid! MFA aktif dan siap digunakan.
              </p>
            )}
            {verifyResult === "failed" && (
              <p className="mt-2 text-xs font-bold text-rose-600">
                Kode OTP tidak valid. Pastikan waktu perangkat Anda sinkron.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
              <strong>Penting:</strong> Setelah MFA aktif, login admin memerlukan kode 6 digit dari Google Authenticator melalui halaman <strong>/mfa</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isChecking) {
    return <div className="text-sm text-stone-500 animate-pulse">Memeriksa status MFA...</div>;
  }

  if (mfaAlreadyActive && !mfaData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <h4 className="font-bold text-emerald-700 text-sm">MFA Sudah Aktif</h4>
        </div>
        <p className="text-sm text-stone-500 max-w-md">
          Akun Anda saat ini telah dilindungi oleh Autentikasi Dua Faktor (MFA).
        </p>
        <button
          onClick={handleEnableMfa}
          disabled={loading}
          className="text-xs font-bold text-stone-900 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Reset MFA (Generate Ulang QR Code)"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start space-y-4">
      <p className="text-sm text-stone-500 max-w-md">Tingkatkan keamanan akun Anda dengan mengaktifkan MFA. Setelah aktif, login admin memerlukan kode 6 digit dari Google Authenticator.</p>
      <div className="flex items-center gap-3 bg-stone-50 py-2 px-4 rounded-full border border-stone-100">
        <div className="w-8 h-4 bg-stone-200 rounded-full relative cursor-pointer">
          <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
        </div>
        <span className="text-xs font-semibold text-stone-600">MFA saat ini nonaktif</span>
      </div>
      {error && (
        <p className="text-xs text-rose-600 font-semibold">{error}</p>
      )}
      <button
        onClick={handleEnableMfa}
        disabled={loading}
        className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-stone-900 text-sm font-semibold text-white hover:bg-stone-800 shadow-sm transition disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        {loading ? "Mengaktifkan..." : "Aktifkan MFA Sekarang"}
      </button>
    </div>
  );
}
