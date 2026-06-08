import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getActorUserId } from "@/lib/server-session";
import { stockAdjustmentSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = stockAdjustmentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const actorUserId = await getActorUserId();
  const currentProduct = await prisma.product.findUnique({
    where: { id: parsed.data.productId }
  });

  if (!currentProduct) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  }

  if (parsed.data.tipe === "OUT" && Number(currentProduct.stok) < parsed.data.jumlah) {
    return NextResponse.json({ error: "Stok tidak cukup untuk pengurangan." }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      stok:
        parsed.data.tipe === "OUT"
          ? {
              decrement: parsed.data.jumlah
            }
          : {
              increment: parsed.data.jumlah
            }
    }
  });

  await prisma.stockMovement.create({
    data: {
      productId: parsed.data.productId,
      tipe: parsed.data.tipe,
      jumlah: new Prisma.Decimal(parsed.data.jumlah),
      keterangan: parsed.data.keterangan,
      userId: actorUserId
    }
  });

  return NextResponse.json(product);
}
