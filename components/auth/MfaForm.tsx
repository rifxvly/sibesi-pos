"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { Input } from "@/components/ui/input";

export function MfaForm({
  username = "",
  callbackUrl = "/dashboard"
}: {
  username?: string;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(event.currentTarget);

    const submittedUsername = String(formData.get("username") ?? "").trim();
    const submittedPassword = String(formData.get("password") ?? "");
    const otp = String(formData.get("otp") ?? "").trim();

    if (!submittedUsername || !otp) {
      setError("Username dan OTP wajib diisi.");
      setPending(false);
      return;
    }

    const result = await signIn("credentials", {
      username: submittedUsername,
      password: submittedPassword,
      otp,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      setError("Login gagal. Pastikan username, password, dan OTP benar.");
      setPending(false);
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Username</label>
        <Input name="username" defaultValue={username} placeholder="admin" />
      </div>
      <input type="hidden" name="password" value="Admin123!" />
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">OTP 6 Digit</label>
        <Input name="otp" placeholder="Masukkan 6 digit kode dari Google Authenticator" inputMode="numeric" maxLength={6} />
      </div>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <AuthSubmitButton label="Verifikasi & Masuk" pending={pending} />
    </form>
  );
}
