import Link from "next/link";
import { PackageOpen, ShieldCheck, Zap, TrendingUp } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams
}: {
  searchParams?: {
    username?: string;
    callbackUrl?: string;
  };
}) {
  return (
    <main className="flex min-h-screen bg-white">
      {/* Left Promotional Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#fcfaf8] overflow-hidden items-center justify-center p-12 border-r border-stone-100">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-amber-200/40 to-orange-300/10 blur-3xl"></div>
          <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-stone-300/30 to-transparent blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 mb-6 shadow-sm">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-stone-600 tracking-wide uppercase">Sistem Pintar</span>
            </div>
            <h1 className="text-5xl font-bold text-stone-900 leading-[1.15] tracking-tight">
              Kelola Toko Besi <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-stone-500">Lebih Modern & Cepat.</span>
            </h1>
            <p className="mt-6 text-lg text-stone-500 leading-relaxed max-w-md">
              Tinggalkan cara lama. Pantau stok, catat penjualan, dan kelola kontrak proyek dalam satu dashboard canggih.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-white/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm">
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Analisis Penjualan Real-time</h3>
                <p className="text-sm text-stone-500 mt-0.5">Pantau omzet dan produk terlaris setiap detiknya.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-white/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Keamanan Setara Bank</h3>
                <p className="text-sm text-stone-500 mt-0.5">Otentikasi dua langkah (MFA) untuk melindungi data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-[420px] space-y-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-stone-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-stone-900/20">
              <PackageOpen className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Selamat Datang</h2>
            <p className="text-stone-500 mt-2">Masuk ke sistem Toko Besi Persahabatan</p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
            <LoginForm
              username={searchParams?.username}
              callbackUrl={searchParams?.callbackUrl ?? "/dashboard"}
            />
            
            <div className="mt-8 text-center border-t border-stone-100 pt-6">
              <p className="text-sm text-stone-500">
                Perlu OTP admin? Lanjut ke{" "}
                <Link className="text-stone-900 font-bold hover:text-amber-600 transition underline underline-offset-4" href="/mfa">
                  halaman MFA
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
