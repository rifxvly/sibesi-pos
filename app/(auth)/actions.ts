"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type AuthFormState = {
  error?: string;
};

async function performSignIn(
  _: AuthFormState,
  formData: FormData,
  withOtp: boolean
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const otp = String(formData.get("otp") ?? "").trim();
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  if (withOtp && !otp) {
    return { error: "Kode OTP wajib diisi untuk verifikasi admin." };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      otp,
      redirectTo: callbackUrl
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: withOtp
            ? "Login gagal. Pastikan username, password, dan OTP benar."
            : "Login gagal. Periksa username dan password, atau gunakan halaman MFA jika akun admin memerlukannya."
        };
      }

      return { error: "Terjadi kendala saat proses login. Coba lagi." };
    }

    throw error;
  }
}

export async function authenticateLogin(
  state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  return performSignIn(state, formData, false);
}

export async function authenticateMfa(
  state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  return performSignIn(state, formData, true);
}
