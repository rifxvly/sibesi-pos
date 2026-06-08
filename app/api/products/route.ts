import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const kategori = searchParams.get("kategori");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(kategori ? { kategori: kategori as never } : {}),
      ...(search
        ? {
            OR: [
              { nama: { contains: search } },
              { kodeBarang: { contains: search } }
            ]
          }
        : {})
    },
    orderBy: { nama: "asc" }
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: parsed.data
  });

  return NextResponse.json(product, { status: 201 });
}
