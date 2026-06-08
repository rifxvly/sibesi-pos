import { readFile } from "fs/promises";
import path from "path";
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
    }
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
