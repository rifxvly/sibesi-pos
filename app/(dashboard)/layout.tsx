import type { ReactNode } from "react";

import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const rawUser = session?.user as Record<string, unknown> | undefined;
  const user = rawUser
    ? {
        username: (rawUser.username as string) ?? "",
        role: (rawUser.role as "ADMIN" | "KASIR") ?? "KASIR",
        email: (rawUser.email as string) ?? ""
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#fafafa] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar role={user?.role} username={user?.username} />
      <div className="min-w-0">
        <Navbar user={user} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
