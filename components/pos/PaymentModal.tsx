"use client";

import { MetodeBayar } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Wallet, X, Banknote, Smartphone, ShieldCheck, AlertTriangle } from "lucide-react";
import { QRCode } from "react-qrcode-logo";

import type { CartItem } from "@/components/pos/CartPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { MoneyDetector } from "@/components/pos/MoneyDetector";

type PaymentPayload = {
  amount: number;
  expiresAt?: string;
  instructions?: string[];
  orderId: string;
  pay_url?: string;
  provider: "dummy" | "wijayapay";
  qr_string?: string;
  reference?: string;
  status: string;
  va_number?: string;
};

type TransactionResponse = {
  id: string;
  noTransaksi: string;
  gateway?: PaymentPayload;
};

export function PaymentModal({
  open,
  total,
  itemCount,
  discount,
  items,
  onClose,
  onTransactionCreated,
  onTransactionCompleted
}: {
  open: boolean;
  total: number;
  itemCount: number;
  discount: number;
  items: CartItem[];
  onClose: () => void;
  onTransactionCreated: () => Promise<void> | void;
  onTransactionCompleted: () => Promise<void> | void;
}) {
  const [cashReceived, setCashReceived] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<MetodeBayar>(MetodeBayar.TUNAI);
  const [payment, setPayment] = useState<PaymentPayload | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionNumber, setTransactionNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);



  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [moneyDetectionPassed, setMoneyDetectionPassed] = useState(false);

  const change = useMemo(() => {
    const received = Number(cashReceived || 0);
    return Math.max(received - total, 0);
  }, [cashReceived, total]);

  useEffect(() => {
    if (!open) {
      setCashReceived("");
      setSelectedMethod(MetodeBayar.TUNAI);
      setPayment(null);
      setTransactionId(null);
      setTransactionNumber(null);
      setLoading(false);
      setMessage(null);
      setError(null);
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName("");
      setMoneyDetectionPassed(false);

    }
  }, [open]);



  if (!open) {
    return null;
  }

  function handleMethodChange(method: MetodeBayar) {
    if (method !== selectedMethod) {
      setPayment(null);
      setTransactionId(null);
      setTransactionNumber(null);
      setMessage(null);
      setError(null);
    }
    setSelectedMethod(method);
  }

  function extractErrorMessage(payload: unknown, fallback: string) {
    if (typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string") {
      return payload.error;
    }

    return fallback;
  }

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiryDate(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  }

  async function createTransaction(method: MetodeBayar) {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          diskon: discount,
          metodeBayar: method,
          uangDiterima: method === MetodeBayar.TUNAI ? Number(cashReceived || 0) : undefined,
          items: items.map((item) => ({
            productId: item.id,
            nama: item.nama,
            jumlah: item.jumlah,
            satuan: item.satuan,
            hargaSatuan: item.hargaSatuan,
            subtotal: item.subtotal
          }))
        })
      });

      const data = (await response.json()) as TransactionResponse | { error?: string };

      if (!response.ok) {
        setError(
          extractErrorMessage(
            data,
            method === MetodeBayar.TUNAI
              ? "Transaksi tunai belum berhasil disimpan."
              : "Transaksi pembayaran digital belum berhasil dibuat."
          )
        );
        return;
      }

      const transaction = data as TransactionResponse;

      if (method === MetodeBayar.TUNAI) {
        setMessage(`Transaksi ${transaction.noTransaksi} berhasil dibayar tunai.`);
        await onTransactionCompleted();
        onClose();
        return;
      }

      setPayment(transaction.gateway ?? null);
      setTransactionId(transaction.id);
      setTransactionNumber(transaction.noTransaksi);
      setMessage(`Transaksi ${transaction.noTransaksi} tersimpan dengan status pending.`);
      await onTransactionCreated();
    } catch {
      setError("Terjadi kendala saat menghubungi server pembayaran.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCashPayment() {
    if (!items.length) {
      setError("Keranjang masih kosong.");
      return;
    }

    if (Number(cashReceived || 0) < total) {
      setError("Uang diterima masih kurang dari total transaksi.");
      return;
    }

    if (!moneyDetectionPassed) {
      setError("Verifikasi uang wajib dilakukan dan harus ASLI sebelum melanjutkan pembayaran.");
      return;
    }

    await createTransaction(MetodeBayar.TUNAI);
  }

  function handleMoneyDetection(result: { status: string }) {
    setMoneyDetectionPassed(result.status === "ASLI");
  }

  async function handleDigitalPayment() {
    if (!items.length) {
      setError("Keranjang masih kosong.");
      return;
    }

    await createTransaction(selectedMethod);
  }

  async function handleCardPayment() {
    if (!items.length) {
      setError("Keranjang masih kosong.");
      return;
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanCardNumber.length < 13) {
      setError("Nomor kartu minimal 13 digit.");
      return;
    }

    if (!cardExpiry || cardExpiry.length < 4) {
      setError("Tanggal kedaluwarsa kartu belum diisi.");
      return;
    }

    if (!cardCvv || cardCvv.length < 3) {
      setError("CVV kartu belum diisi.");
      return;
    }

    await createTransaction(MetodeBayar.KREDIT);
  }

  async function handleMarkAsPaid() {
    if (!transactionId) {
      setError("Transaksi digital belum dibuat.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "PAID"
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(extractErrorMessage(data, "Pembayaran simulasi belum berhasil dikonfirmasi."));
        return;
      }

      setPayment((current) => (current ? { ...current, status: "PAID" } : current));
      setMessage(`Pembayaran ${transactionNumber ?? ""} berhasil disimulasikan.`);
      await onTransactionCompleted();
      onClose();
    } catch {
      setError("Terjadi kendala saat mengubah status transaksi.");
    } finally {
      setLoading(false);
    }
  }

  const paymentMethods = [
    { method: MetodeBayar.TUNAI, icon: Banknote, label: "Uang Tunai", sublabel: "Kertas & Logam" },
    { method: MetodeBayar.KREDIT, icon: CreditCard, label: "Kartu Debit/Kredit", sublabel: "Visa, Mastercard" },
    { method: MetodeBayar.QRIS, icon: Smartphone, label: "E-Wallet / QRIS", sublabel: "Dana, Gopay, OVO" },
    { method: MetodeBayar.VIRTUAL_ACCOUNT, icon: Wallet, label: "Virtual Account", sublabel: "Transfer Bank" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,25,23,0.38)] p-4 backdrop-blur">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="default">Pembayaran</Badge>
            <h3 className="mt-3 text-2xl font-semibold text-stone-900">Selesaikan transaksi</h3>
            <p className="mt-2 text-sm text-stone-500">
              Pilih metode pembayaran: tunai, kartu debit/kredit, e-wallet (Dana, Gopay, OVO), atau virtual account.
            </p>
          </div>
          <button className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:border-stone-300 hover:text-stone-900" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="space-y-5 p-4">
            <div>
              <p className="text-sm text-stone-500">Ringkasan</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">{formatCurrency(total)}</p>
              <p className="mt-2 text-sm text-stone-500">{itemCount} item dalam transaksi ini.</p>
            </div>

            <div className="space-y-2">
              {paymentMethods.map(({ method, icon: Icon, label, sublabel }) => (
                <button
                  key={method}
                  onClick={() => handleMethodChange(method)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    selectedMethod === method
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{label}</p>
                    <p className={`text-[11px] leading-tight ${selectedMethod === method ? "text-stone-300" : "text-stone-400"}`}>{sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="grid gap-4">
            {/* ========== TUNAI (Cash) ========== */}
            {selectedMethod === MetodeBayar.TUNAI ? (
              <Card className="space-y-4 p-5">
                <div>
                  <p className="text-lg font-semibold text-stone-900">Pembayaran Tunai</p>
                  <p className="mt-1 text-sm text-stone-500">Masukkan uang kertas/logam diterima untuk melihat kembalian secara instan.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-stone-600">Uang diterima</label>
                    <Input
                      type="number"
                      value={cashReceived}
                      onChange={(event) => setCashReceived(event.target.value)}
                      placeholder="Contoh: 500000"
                    />
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                    <p className="text-sm text-stone-500">Kembalian</p>
                    <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(change)}</p>
                  </div>
                </div>

                {/* Quick amount buttons */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 mb-2">Pilih nominal cepat</p>
                  <div className="flex flex-wrap gap-2">
                    {[10000, 20000, 50000, 100000, 200000, 500000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCashReceived(String(amount))}
                        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition"
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                    <button
                      onClick={() => setCashReceived(String(total))}
                      className="rounded-lg border border-stone-900 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition"
                    >
                      Uang Pas
                    </button>
                  </div>
                </div>

                {/* ===== DETEKSI UANG PALSU (KAMERA) ===== */}
                <MoneyDetector onDetectionComplete={handleMoneyDetection} />

                {/* Detection Status Indicator */}
                <div className={`rounded-xl border px-4 py-3 ${
                  moneyDetectionPassed 
                    ? "border-emerald-300 bg-emerald-50" 
                    : "border-amber-300 bg-amber-50"
                }`}>
                  <div className="flex items-center gap-2">
                    {moneyDetectionPassed ? (
                      <>
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-800">Verifikasi Selesai - Uang ASLI</p>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <p className="text-sm font-semibold text-amber-800">Verifikasi Uang Wajib Dilakukan</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleCashPayment} 
                    disabled={loading || !items.length || !moneyDetectionPassed}
                  >
                    {loading ? "Menyimpan transaksi..." : !moneyDetectionPassed ? "Scan Uang Terlebih Dahulu" : "Bayar Tunai Sekarang"}
                  </Button>
                </div>
              </Card>
            ) : null}

            {/* ========== KARTU DEBIT/KREDIT ========== */}
            {selectedMethod === MetodeBayar.KREDIT ? (
              <Card className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">Kartu Debit/Kredit</p>
                    <p className="mt-1 text-sm text-stone-500">Simulasi pembayaran dengan kartu debit atau kredit (Visa, Mastercard, dll).</p>
                  </div>
                  <Badge tone="warning">Simulasi</Badge>
                </div>

                {!payment ? (
                  <>
                    {/* Card icons */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5">
                        <div className="flex">
                          <div className="h-5 w-5 rounded-full bg-red-500 opacity-80" />
                          <div className="h-5 w-5 rounded-full bg-amber-400 -ml-2 opacity-80" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-500">Mastercard</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5">
                        <span className="text-sm font-bold italic text-blue-700">VISA</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5">
                        <span className="text-[10px] font-bold text-stone-500">GPN</span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-stone-600">Nomor Kartu</label>
                        <Input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4000 1234 5678 9010"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-stone-600">Masa Berlaku</label>
                          <Input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-stone-600">CVV</label>
                          <Input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-stone-600">Nama Pemegang Kartu</label>
                        <Input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          placeholder="Nama sesuai kartu"
                        />
                      </div>
                    </div>
                    <Button onClick={handleCardPayment} disabled={loading || !items.length}>
                      {loading ? "Memproses pembayaran kartu..." : `Bayar ${formatCurrency(total)} dengan Kartu`}
                    </Button>
                  </>
                ) : null}

                {payment ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="h-5 w-5 text-stone-500" />
                      <div>
                        <p className="text-stone-500">No. Transaksi</p>
                        <p className="font-medium text-stone-900">{transactionNumber ?? "-"}</p>
                      </div>
                    </div>
                    {payment.va_number ? (
                      <div>
                        <p className="text-sm text-stone-500">Authorization Code</p>
                        <p className="mt-1 font-mono text-lg font-semibold text-stone-900">{payment.va_number}</p>
                      </div>
                    ) : null}
                    {payment.instructions?.length ? (
                      <div className="space-y-1.5 text-sm text-stone-600">
                        {payment.instructions.map((instruction) => (
                          <p key={instruction}>{instruction}</p>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex justify-end pt-2">
                      <Button onClick={handleMarkAsPaid} disabled={loading}>
                        {loading ? "Memproses..." : "Konfirmasi Pembayaran Kartu"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}

            {/* ========== QRIS / E-Wallet (Dana, Gopay, OVO) ========== */}
            {selectedMethod === MetodeBayar.QRIS ? (
              <Card className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">QRIS / E-Wallet</p>
                    <p className="mt-1 text-sm text-stone-500">Bayar melalui Dana, Gopay, OVO, atau scan QRIS dari dompet digital manapun.</p>
                  </div>
                  <Badge tone="warning">Simulasi</Badge>
                </div>

                {/* E-Wallet logos */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5">
                    <span className="text-[11px] font-bold text-blue-600">dana</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                    <span className="text-[11px] font-bold text-emerald-600">gopay</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5">
                    <span className="text-[11px] font-bold text-purple-600">OVO</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5">
                    <span className="text-[11px] font-bold text-stone-500">QRIS</span>
                  </div>
                </div>

                <Button onClick={handleDigitalPayment} disabled={loading || !items.length}>
                  {loading ? "Menyimpan transaksi..." : "Buat Transaksi QRIS / E-Wallet"}
                </Button>
                {payment?.qr_string ? (
                  <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-4">
                      <div className="rounded-xl border border-stone-100 bg-white p-2">
                        <QRCode
                          value={payment.qr_string}
                          size={180}
                          bgColor="#ffffff"
                          fgColor="#1c1917"
                          qrStyle="dots"
                          eyeRadius={8}
                          quietZone={8}
                        />
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] font-bold text-stone-500">QRIS</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Dana</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Gopay</span>
                        <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">OVO</span>
                      </div>
                      <p className="mt-2 text-[10px] text-stone-400 text-center">Scan dengan aplikasi e-wallet</p>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <p className="text-sm text-stone-500">No. Transaksi</p>
                      <p className="mt-1 font-medium text-stone-900">{transactionNumber ?? "-"}</p>
                      <p className="mt-3 text-sm text-stone-500">Total Pembayaran</p>
                      <p className="mt-1 text-xl font-bold text-stone-900">{formatCurrency(total)}</p>
                      <p className="mt-3 text-sm text-stone-500">Reference</p>
                      <p className="mt-1 font-medium text-stone-900">{payment.reference ?? payment.orderId}</p>
                      {payment.instructions?.length ? (
                        <div className="mt-4 space-y-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
                          {payment.instructions.map((instruction) => (
                            <p key={instruction}>• {instruction}</p>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-5 flex justify-end">
                        <Button onClick={handleMarkAsPaid} disabled={loading}>
                          {loading ? "Memproses..." : "Konfirmasi Pembayaran Diterima"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}

            {/* ========== VIRTUAL ACCOUNT ========== */}
            {selectedMethod === MetodeBayar.VIRTUAL_ACCOUNT ? (
              <Card className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">Virtual Account / Transfer Bank</p>
                    <p className="mt-1 text-sm text-stone-500">Simulasi pembayaran melalui transfer bank atau VA.</p>
                  </div>
                  <Badge tone="warning">Simulasi</Badge>
                </div>
                <Button onClick={handleDigitalPayment} disabled={loading || !items.length}>
                  {loading ? "Menyimpan transaksi..." : "Buat Transaksi VA"}
                </Button>
                {payment?.va_number ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">No. Transaksi</p>
                    <p className="mt-1 font-medium text-stone-900">{transactionNumber ?? "-"}</p>
                    <p className="text-sm text-stone-500">Nomor VA</p>
                    <p className="mt-2 text-2xl font-semibold text-stone-900">{payment.va_number}</p>
                    <p className="mt-4 text-sm text-stone-500">
                      Berlaku sampai {payment.expiresAt ? new Date(payment.expiresAt).toLocaleString("id-ID") : "-"}
                    </p>
                    {payment.instructions?.length ? (
                      <div className="mt-4 space-y-2 text-sm text-stone-600">
                        {payment.instructions.map((instruction) => (
                          <p key={instruction}>{instruction}</p>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-5 flex justify-end">
                      <Button onClick={handleMarkAsPaid} disabled={loading}>
                        {loading ? "Memproses..." : "Simulasikan Pembayaran Berhasil"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}

            {message ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{message}</p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
