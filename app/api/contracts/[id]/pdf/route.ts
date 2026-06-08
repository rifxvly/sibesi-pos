import { readFile } from "fs/promises";
import path from "path";
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
    where: { id: params.id }
  });

  if (!contract?.filePdf) {
    return NextResponse.json({ error: "Contract PDF not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", contract.filePdf.replace(/^\//, ""));
  const file = await readFile(filePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${contract.noKontrak}.pdf"`
    }
  });
}
