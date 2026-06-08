import { Prisma, StatusTransaksi } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getActorUserId } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      details: true,
      customer: true,
      user: true
    }
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(transaction);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = (await request.json()) as { status?: StatusTransaksi };

  if (!payload.status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const actorUserId = await getActorUserId();

  const transaction = await prisma.$transaction(async (tx) => {
    const current = await tx.transaction.findUnique({
      where: { id: params.id },
      include: {
        details: true,
        customer: true,
        user: true
      }
    });

    if (!current) {
      throw new Error("TRANSACTION_NOT_FOUND");
    }

    const isTransitioningToPaid =
      current.status !== StatusTransaksi.PAID && payload.status === StatusTransaksi.PAID;

    if (isTransitioningToPaid) {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: current.details.map((item) => item.productId)
          }
        },
        select: {
          id: true,
          nama: true,
          stok: true
        }
      });

      const insufficientProducts = current.details
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          if (!product || Number(product.stok) < Number(item.jumlah)) {
            return product?.nama ?? item.productId;
          }
          return null;
        })
        .filter((item): item is string => Boolean(item));

      if (insufficientProducts.length) {
        throw new Error(`INSUFFICIENT_STOCK:${insufficientProducts.join(",")}`);
      }
    }

    const updated = await tx.transaction.update({
      where: { id: params.id },
      data: {
        status: payload.status
      },
      include: {
        details: true,
        customer: true,
        user: true
      }
    });

    if (isTransitioningToPaid) {
      for (const item of current.details) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stok: {
              decrement: new Prisma.Decimal(item.jumlah)
            }
          }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            tipe: "OUT",
            jumlah: new Prisma.Decimal(item.jumlah),
            keterangan: `Transaksi ${current.noTransaksi}`,
            userId: actorUserId
          }
        });
      }
    }

    return updated;
  }).catch((error: Error) => {
    if (error.message === "TRANSACTION_NOT_FOUND") {
      return null;
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return NextResponse.json(
        {
          error: `Stok tidak cukup untuk: ${error.message.replace("INSUFFICIENT_STOCK:", "").replaceAll(",", ", ")}`
        },
        { status: 400 }
      );
    }

    throw error;
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  if (transaction instanceof NextResponse) {
    return transaction;
  }

  return NextResponse.json(transaction);
}
