import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const users = await prisma.user.findMany({
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
        select: {
          id: true,
          kode: true,
          nama: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  const payload = await request.json();

  if (!payload.username || !payload.email || !payload.password || !payload.role) {
    return NextResponse.json({ error: "Username, email, password, dan role wajib diisi" }, { status: 400 });
  }

  if (!["ADMIN", "KASIR", "SUPPLIER"].includes(payload.role)) {
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  }

  if (payload.role === "SUPPLIER" && !payload.supplierId) {
    return NextResponse.json({ error: "Supplier ID wajib diisi untuk role Supplier" }, { status: 400 });
  }

  const existingUsername = await prisma.user.findFirst({ where: { username: payload.username } });
  if (existingUsername) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
  }

  const existingEmail = await prisma.user.findFirst({ where: { email: payload.email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      username: payload.username,
      email: payload.email,
      passwordHash,
      role: payload.role,
      isActive: payload.isActive !== false,
      supplierId: payload.supplierId || null,
      updatedAt: new Date()
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      mfaEnabled: true,
      createdAt: true,
      supplier: {
        select: { id: true, kode: true, nama: true }
      }
    }
  });

  return NextResponse.json(user, { status: 201 });
}
