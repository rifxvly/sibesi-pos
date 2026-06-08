import type { ReactNode } from "react";

import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? {
        username: session.user.username,
        role: session.user.role,
        email: session.user.email
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
