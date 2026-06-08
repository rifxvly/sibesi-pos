import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/totp";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  otp: z.string().optional()
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { username, password, otp } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { username }
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        if (user.role === "ADMIN" && user.mfaEnabled && !verifyTotpToken(otp ?? "", user.mfaSecret)) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          username: user.username,
          role: user.role
        };
      }
    })
  ]
});
