import { NextResponse } from "next/server";

import { ensureAdminApi, ensureRoleApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await ensureRoleApi(["ADMIN", "KASIR"]);

  if (guard) {
    return guard;
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: parsed.data
  });

  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  await prisma.product.update({
    where: { id: params.id },
    data: { isActive: false }
  });

  return NextResponse.json({ ok: true });
}
