import { MetodeBayar, Prisma, StatusTransaksi } from "@prisma/client";
import { NextResponse } from "next/server";

import { createGatewayPayment } from "@/lib/payment-gateway";
import { prisma } from "@/lib/prisma";
import { ensureRoleApi } from "@/lib/access";
import { getActorUserId } from "@/lib/server-session";
import { transactionSchema } from "@/lib/validations";
import { generateTransactionNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await ensureRoleApi(["ADMIN", "KASIR"]);

  if (guard) {
    return guard;
  }

  const transactions = await prisma.transaction.findMany({
    include: {
      details: true,
      customer: true,
      user: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const guard = await ensureRoleApi(["ADMIN", "KASIR"]);

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = transactionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const total = parsed.data.items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAkhir = Math.max(total - parsed.data.diskon, 0);
  const transactionCount = await prisma.transaction.count();
  const noTransaksi = generateTransactionNumber(transactionCount + 1);
  const actorUserId = await getActorUserId();
  const requiresImmediateStockDeduction =
    parsed.data.metodeBayar === MetodeBayar.TUNAI || parsed.data.metodeBayar === MetodeBayar.TRANSFER;

  if (parsed.data.metodeBayar === MetodeBayar.TUNAI && (parsed.data.uangDiterima ?? 0) < totalAkhir) {
    return NextResponse.json({ error: "Uang diterima tidak cukup untuk transaksi tunai." }, { status: 400 });
  }

  if (requiresImmediateStockDeduction) {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: parsed.data.items.map((item) => item.productId)
        }
      },
      select: {
        id: true,
        nama: true,
        stok: true
      }
    });

    const insufficientProducts = parsed.data.items
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product || Number(product.stok) < item.jumlah) {
          return item.nama;
        }
        return null;
      })
      .filter((item): item is string => Boolean(item));

    if (insufficientProducts.length) {
      return NextResponse.json(
        {
          error: `Stok tidak cukup untuk: ${insufficientProducts.join(", ")}`
        },
        { status: 400 }
      );
    }
  }

  const transaction = await prisma.$transaction(async (tx) => {
    const created = await tx.transaction.create({
      data: {
        id: crypto.randomUUID(),
        noTransaksi,
        userId: actorUserId,
        customerId: parsed.data.customerId ?? undefined,
        total: new Prisma.Decimal(total),
        diskon: new Prisma.Decimal(parsed.data.diskon),
        totalAkhir: new Prisma.Decimal(totalAkhir),
        metodeBayar: parsed.data.metodeBayar,
        status: requiresImmediateStockDeduction ? StatusTransaksi.PAID : StatusTransaksi.PENDING,
        uangDiterima: parsed.data.uangDiterima ? new Prisma.Decimal(parsed.data.uangDiterima) : undefined,
        kembalian:
          parsed.data.uangDiterima && parsed.data.metodeBayar === MetodeBayar.TUNAI
            ? new Prisma.Decimal(parsed.data.uangDiterima - totalAkhir)
            : undefined,
        catatan: parsed.data.catatan ?? undefined,
        details: {
          create: parsed.data.items.map((item) => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            jumlah: new Prisma.Decimal(item.jumlah),
            satuan: item.satuan,
            hargaSatuan: new Prisma.Decimal(item.hargaSatuan),
            subtotal: new Prisma.Decimal(item.subtotal)
          }))
        }
      },
      include: {
        details: true
      }
    });

    if (created.status === StatusTransaksi.PAID) {
      for (const item of parsed.data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stok: {
              decrement: item.jumlah
            }
          }
        });

        await tx.stockMovement.create({
          data: {
            id: crypto.randomUUID(),
            productId: item.productId,
            tipe: "OUT",
            jumlah: new Prisma.Decimal(item.jumlah),
            keterangan: `Transaksi ${noTransaksi}`,
            userId: actorUserId
          }
        });
      }
    }

    return created;
  });

  if (parsed.data.metodeBayar === MetodeBayar.QRIS || parsed.data.metodeBayar === MetodeBayar.VIRTUAL_ACCOUNT || parsed.data.metodeBayar === MetodeBayar.KREDIT) {
    const method =
      parsed.data.metodeBayar === MetodeBayar.QRIS
        ? "qris"
        : parsed.data.metodeBayar === MetodeBayar.KREDIT
          ? "card"
          : "bca_va";
    const payment = await createGatewayPayment(method, noTransaksi, totalAkhir);

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        gatewayOrderId: payment.reference ?? noTransaksi,
        gatewayPayUrl: payment.pay_url
      }
    });

    return NextResponse.json(
      {
        ...transaction,
        gateway: payment
      },
      { status: 201 }
    );
  }

  return NextResponse.json(transaction, { status: 201 });
}
