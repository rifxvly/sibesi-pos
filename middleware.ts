import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";

const publicPaths = ["/login", "/mfa"];
const publicApiPrefixes = ["/api/auth", "/api/wijayapay/webhook"];
const protectedAppPaths = ["/dashboard", "/pos", "/products", "/stock", "/contracts", "/customers", "/reports", "/settings", "/users"];
const roleHome = {
  ADMIN: "/dashboard",
  KASIR: "/pos",
  SUPPLIER: "/contracts"
} as const;
const roleAllowedPaths = {
  ADMIN: protectedAppPaths,
  KASIR: ["/pos", "/stock", "/customers"],
  SUPPLIER: ["/contracts"]
} as const;
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const userRole = request.auth?.user?.role as keyof typeof roleAllowedPaths | undefined;
  const isLoggedIn = Boolean(request.auth?.user);
  const isPublicPage = publicPaths.includes(pathname);
  const isPublicApi = publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isProtectedAppRoute = protectedAppPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (isPublicPage && isLoggedIn) {
    return NextResponse.redirect(new URL(userRole ? roleHome[userRole] : "/dashboard", request.url));
  }

  if (isProtectedAppRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    userRole &&
    isProtectedAppRoute &&
    !roleAllowedPaths[userRole].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return NextResponse.redirect(new URL(roleHome[userRole], request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pos/:path*",
    "/products/:path*",
    "/stock/:path*",
    "/contracts/:path*",
    "/customers/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/login",
    "/mfa",
    "/api/:path*"
  ]
};
