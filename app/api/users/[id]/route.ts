import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      mfaEnabled: true,
      createdAt: true,
      updatedAt: true,
      supplier: {
        select: { id: true, kode: true, nama: true }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const payload = await request.json();

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  if (payload.username && payload.username !== existing.username) {
    const duplicate = await prisma.user.findFirst({ where: { username: payload.username } });
    if (duplicate) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }
  }

  if (payload.email && payload.email !== existing.email) {
    const duplicate = await prisma.user.findFirst({ where: { email: payload.email } });
    if (duplicate) {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }
  }

  if (payload.role && !["ADMIN", "KASIR", "SUPPLIER"].includes(payload.role)) {
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (payload.username) updateData.username = payload.username;
  if (payload.email) updateData.email = payload.email;
  if (payload.role) updateData.role = payload.role;
  if (typeof payload.isActive === "boolean") updateData.isActive = payload.isActive;
  if (payload.supplierId !== undefined) updateData.supplierId = payload.supplierId || null;

  if (payload.password) {
    const bcrypt = await import("bcryptjs");
    updateData.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  updateData.updatedAt = new Date();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      mfaEnabled: true,
      createdAt: true,
      updatedAt: true,
      supplier: {
        select: { id: true, kode: true, nama: true }
      }
    }
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  if (existing.username === "admin") {
    return NextResponse.json({ error: "Tidak dapat menghapus akun admin utama" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "User berhasil dihapus" });
}
