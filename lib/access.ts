import { NextResponse } from "next/server";

import { auth } from "@/auth";

export type AppRole = "ADMIN" | "KASIR" | "SUPPLIER";

export async function getSessionUser() {
  const session = await auth();
  return session?.user;
}

export async function ensureAuthenticatedApi() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function getAuthorizedApiUser(allowedRoles: AppRole[]) {
  const user = await getSessionUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 })
    };
  }

  return { user, response: null };
}

export async function ensureRoleApi(allowedRoles: AppRole[]) {
  const { response } = await getAuthorizedApiUser(allowedRoles);
  return response;
}

export async function ensureAdminApi() {
  return ensureRoleApi(["ADMIN"]);
}
