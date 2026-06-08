import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getActorUserId() {
  const session = await auth();

  if (session?.user?.id) {
    return session.user.id;
  }

  const fallback = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }]
  });

  if (!fallback) {
    throw new Error("No active user found. Seed the database first.");
  }

  return fallback.id;
}
