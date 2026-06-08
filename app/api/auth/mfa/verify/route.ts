import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/totp";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().length(6)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = verifyTotpToken(parsed.data.token, user.mfaSecret);
  return NextResponse.json({ valid });
}
