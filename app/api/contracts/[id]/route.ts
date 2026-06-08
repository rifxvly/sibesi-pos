import { NextResponse } from "next/server";

import { getAuthorizedApiUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { user, response } = await getAuthorizedApiUser(["ADMIN", "SUPPLIER"]);

  if (response || !user) {
    return response;
  }

  if (user.role === "SUPPLIER" && !user.supplierId) {
    return NextResponse.json({ error: "Supplier account is not linked to a supplier." }, { status: 403 });
  }

  const contract = await prisma.contract.findFirst({
    where: {
      id: params.id,
      ...(user.role === "SUPPLIER" ? { supplierId: user.supplierId } : {})
    },
    include: {
      customer: true,
      supplier: true,
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
