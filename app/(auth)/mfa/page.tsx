import { ShieldCheck } from "lucide-react";

import { MfaForm } from "@/components/auth/MfaForm";
import { Badge } from "@/components/ui/badge";

export default function MfaPage({
  searchParams
}: {
  searchParams?: {
    username?: string;
    callbackUrl?: string;
  };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] p-6">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-4">
          <Badge tone="warning">Admin MFA</Badge>
        </div>
        <div className="flex flex-col items-center text-center">
          <ShieldCheck className="h-10 w-10 text-stone-900" />
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Verifikasi Dua Langkah</h1>
          <p className="mt-3 text-sm text-stone-500">
            Masukkan username dan 6 digit kode OTP dari Google Authenticator Anda.
          </p>
        </div>

        <MfaForm
          username={searchParams?.username}
          callbackUrl={searchParams?.callbackUrl ?? "/dashboard"}
        />
      </div>
    </main>
  );
}
