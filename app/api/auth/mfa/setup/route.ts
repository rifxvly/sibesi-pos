import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { buildTotpUri, generateTotpSecret } from "@/lib/totp";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const secret = generateTotpSecret(user.email);
  const otpAuthUrl = buildTotpUri(user.email, secret);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaSecret: secret,
      mfaEnabled: true
    }
  });

  return NextResponse.json({
    secret,
    otpAuthUrl
  });
}
