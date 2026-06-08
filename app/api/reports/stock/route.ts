import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stok: "asc" }
  });

  return NextResponse.json(products);
}
