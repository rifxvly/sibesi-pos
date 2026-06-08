import { Prisma, StatusTransaksi } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json();
  const { ref_id, status, nominal, trx_reference } = payload as {
    ref_id?: string;
    status?: string;
    nominal?: string | number;
    trx_reference?: string;
  };

  if (!ref_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      gatewayOrderId: ref_id
    },
    include: {
      details: true
    }
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const nominalAmount = Number(nominal ?? 0);
  if (nominalAmount > 0 && Number(transaction.totalAkhir) !== nominalAmount) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
  }

  const isPaid = status === "success" || status === "paid" || status === "settlement";

  if (isPaid && transaction.status !== StatusTransaksi.PAID) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: StatusTransaksi.PAID
      }
    });

    await prisma.$transaction(
      transaction.details.flatMap((item) => [
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stok: {
              decrement: new Prisma.Decimal(item.jumlah)
            }
          }
        }),
        prisma.stockMovement.create({
          data: {
            productId: item.productId,
            tipe: "OUT",
            jumlah: new Prisma.Decimal(item.jumlah),
            keterangan: `Webhook pembayaran ${transaction.noTransaksi}`,
            userId: transaction.userId
          }
        })
      ])
    );
  }

  return NextResponse.json({ status: true });
}
