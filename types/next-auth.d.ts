import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "KASIR" | "SUPPLIER";
      username: string;
      supplierId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "KASIR" | "SUPPLIER";
    username?: string;
    supplierId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    username?: string;
    supplierId?: string | null;
  }
}
