import { StatusKontrak } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { generateContractPDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import { getActorUserId } from "@/lib/server-session";
import { approveContractSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = approveContractSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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

  let hashValue: string | null = null;
  let filePdf: string | null = null;
  const actorUserId = await getActorUserId();

  if (parsed.data.status === StatusKontrak.APPROVED) {
    const generated = await generateContractPDF({
      noKontrak: contract.noKontrak,
      customerName: contract.customer.nama,
      customerAddress: contract.alamatKirim ?? "-",
      jadwalKirim: contract.jadwalKirim?.toISOString(),
      totalNilai: Number(contract.totalNilai ?? 0),
      dp: Number(contract.dp ?? 0),
      tempoPembayaran: contract.tempoPembayaran ?? 0,
      items: contract.items.map((item) => ({
        nama: item.product.nama,
        jumlah: Number(item.jumlah),
        satuan: item.satuan,
        hargaSatuan: Number(item.hargaSatuan),
        subtotal: Number(item.subtotal)
      }))
    });

    hashValue = generated.hashValue;
    filePdf = `/uploads/contracts/${contract.noKontrak}.pdf`;
    const outputDir = path.join(process.cwd(), "public", "uploads", "contracts");
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, `${contract.noKontrak}.pdf`), generated.pdfBytes);
  }

  const updated = await prisma.contract.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      catatanAdmin: parsed.data.catatanAdmin ?? undefined,
      approvedById: actorUserId,
      hashValue: hashValue ?? undefined,
      filePdf: filePdf ?? undefined
    }
  });

  return NextResponse.json(updated);
}
