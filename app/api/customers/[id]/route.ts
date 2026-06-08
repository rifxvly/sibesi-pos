import { NextResponse } from "next/server";

import { ensureRoleApi } from "@/lib/access";
import { decrypt, encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await ensureRoleApi(["ADMIN", "KASIR"]);

  if (guard) {
    return guard;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: params.id }
  });

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...customer,
    npwp: customer.npwp ? decrypt(customer.npwp) : null,
    alamat: customer.alamat ? decrypt(customer.alamat) : null
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const guard = await ensureRoleApi(["ADMIN", "KASIR"]);

  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = customerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id: params.id },
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

  return NextResponse.json({
    ...customer,
    npwp: parsed.data.npwp ?? null,
    alamat: parsed.data.alamat ?? null
  });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await ensureRoleApi(["ADMIN", "KASIR"]);

  if (guard) {
    return guard;
  }

  await prisma.customer.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ ok: true });
}
