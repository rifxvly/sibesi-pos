import { Prisma, StatusKontrak } from "@prisma/client";
import { NextResponse } from "next/server";

import { ensureAdminApi, getAuthorizedApiUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getActorUserId } from "@/lib/server-session";
import { contractSchema } from "@/lib/validations";
import { generateContractNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, response } = await getAuthorizedApiUser(["ADMIN", "SUPPLIER"]);

  if (response || !user) {
    return response;
  }

  if (user.role === "SUPPLIER" && !user.supplierId) {
    return NextResponse.json({ error: "Supplier account is not linked to a supplier." }, { status: 403 });
  }

  const contracts = await prisma.contract.findMany({
    where: user.role === "SUPPLIER" ? { supplierId: user.supplierId } : undefined,
    include: {
      customer: true,
      supplier: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = contractSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const contractCount = await prisma.contract.count();
  const totalNilai = parsed.data.items.reduce((sum, item) => sum + item.subtotal, 0);
  const actorUserId = await getActorUserId();

  const contract = await prisma.contract.create({
    data: {
      id: crypto.randomUUID(),
      noKontrak: generateContractNumber(contractCount + 1),
      customerId: parsed.data.customerId,
      transactionId: parsed.data.transactionId ?? undefined,
      alamatKirim: parsed.data.alamatKirim,
      jadwalKirim: parsed.data.jadwalKirim ? new Date(parsed.data.jadwalKirim) : undefined,
      tempoPembayaran: parsed.data.tempoPembayaran,
      dp: parsed.data.dp ? new Prisma.Decimal(parsed.data.dp) : undefined,
      dpPersen: parsed.data.dpPersen ? new Prisma.Decimal(parsed.data.dpPersen) : undefined,
      totalNilai: new Prisma.Decimal(totalNilai),
      catatanAdmin: parsed.data.catatanAdmin ?? undefined,
      status: StatusKontrak.REVIEW,
      createdById: actorUserId,
      updatedAt: new Date(),
      items: {
        create: parsed.data.items.map((item) => ({
          id: crypto.randomUUID(),
          productId: item.productId,
          spesifikasi: item.spesifikasi ?? undefined,
          jumlah: new Prisma.Decimal(item.jumlah),
          satuan: item.satuan,
          hargaSatuan: new Prisma.Decimal(item.hargaSatuan),
          subtotal: new Prisma.Decimal(item.subtotal)
        }))
      }
    },
    include: {
      customer: true,
      items: true
    }
  });

  return NextResponse.json(contract, { status: 201 });
}
