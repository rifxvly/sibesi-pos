import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json(contract);
}
