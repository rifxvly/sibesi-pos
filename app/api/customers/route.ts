import { NextResponse } from "next/server";

import { ensureAuthenticatedApi } from "@/lib/access";
import { decrypt, encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await ensureAuthenticatedApi();

  if (guard) {
    return guard;
  }

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(
    customers.map((customer) => ({
      ...customer,
      npwp: customer.npwp ? decrypt(customer.npwp) : null,
      alamat: customer.alamat ? decrypt(customer.alamat) : null
    }))
  );
}

export async function POST(request: Request) {
  const guard = await ensureAuthenticatedApi();

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = customerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      nama: parsed.data.nama,
      tipe: parsed.data.tipe,
      perusahaan: parsed.data.perusahaan || null,
      npwp: parsed.data.npwp ? encrypt(parsed.data.npwp) : null,
      alamat: parsed.data.alamat ? encrypt(parsed.data.alamat) : null,
      telepon: parsed.data.telepon || null,
      email: parsed.data.email || null
    }
  });

  return NextResponse.json(
    {
      ...customer,
      npwp: parsed.data.npwp ?? null,
      alamat: parsed.data.alamat ?? null
    },
    { status: 201 }
  );
}
