import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 15
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.supplierId = user.supplierId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "ADMIN" | "KASIR" | "SUPPLIER";
        session.user.username = token.username as string;
        session.user.supplierId = token.supplierId as string | null | undefined;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
