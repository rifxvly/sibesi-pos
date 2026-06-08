"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { Input } from "@/components/ui/input";

export function LoginForm({
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

    if (!submittedUsername || !submittedPassword) {
      setError("Username dan password wajib diisi.");
      setPending(false);
      return;
    }

    const result = await signIn("credentials", {
      username: submittedUsername,
      password: submittedPassword,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      // If admin login fails, likely MFA is required - redirect to MFA page
      if (submittedUsername === "admin") {
        router.push(`/mfa?username=${encodeURIComponent(submittedUsername)}`);
        return;
      }
      setError("Login gagal. Periksa username dan password.");
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
        <Input name="username" defaultValue={username} placeholder="admin atau kasir1" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">Password</label>
        <Input name="password" type="password" placeholder="********" />
      </div>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <AuthSubmitButton label="Masuk" pending={pending} />
    </form>
  );
}
