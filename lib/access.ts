import { NextResponse } from "next/server";

import { auth } from "@/auth";

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

export async function ensureAdminApi() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
