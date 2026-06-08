import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  return NextResponse.json({
    available: ["/api/reports/sales", "/api/reports/stock"]
  });
}
