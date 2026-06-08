import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";

const publicPaths = ["/login", "/mfa"];
const publicApiPrefixes = ["/api/auth", "/api/wijayapay/webhook"];
const kasirAllowedPaths = ["/pos", "/stock", "/customers"];
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const userRole = request.auth?.user?.role;
  const isLoggedIn = Boolean(request.auth?.user);
  const isPublicPage = publicPaths.includes(pathname);
  const isPublicApi = publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isProtectedAppRoute =
    ["/dashboard", "/pos", "/products", "/stock", "/contracts", "/customers", "/reports", "/settings"].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (isPublicPage && isLoggedIn) {
    return NextResponse.redirect(new URL(userRole === "KASIR" ? "/pos" : "/dashboard", request.url));
  }

  if (isProtectedAppRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    userRole === "KASIR" &&
    isProtectedAppRoute &&
    !kasirAllowedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return NextResponse.redirect(new URL("/pos", request.url));
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
    "/login",
    "/mfa",
    "/api/:path*"
  ]
};
