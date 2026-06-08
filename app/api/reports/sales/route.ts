import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      status: "PAID"
    },
    include: {
      user: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(transactions);
}
