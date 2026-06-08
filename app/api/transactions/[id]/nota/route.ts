import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      details: {
        include: {
          product: true
        }
      },
      user: true,
      customer: true
    }
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([320, 480]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawText("NOTA SIBESI POS", { x: 24, y: 440, size: 16, font: bold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(transaction.noTransaksi, { x: 24, y: 420, size: 10, font });
  page.drawText(`Kasir: ${transaction.user.username}`, { x: 24, y: 404, size: 10, font });

  let y = 376;
  for (const item of transaction.details) {
    page.drawText(`${item.product.nama}`, { x: 24, y, size: 10, font });
    y -= 14;
    page.drawText(
      `${item.jumlah} ${item.satuan} x ${formatCurrency(Number(item.hargaSatuan))} = ${formatCurrency(Number(item.subtotal))}`,
      { x: 24, y, size: 9, font }
    );
    y -= 22;
  }

  page.drawText(`Total: ${formatCurrency(Number(transaction.totalAkhir))}`, {
    x: 24,
    y: 48,
    size: 12,
    font: bold
  });

  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${transaction.noTransaksi}.pdf"`
    }
  });
}
