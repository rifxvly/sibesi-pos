"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Button variant="secondary" className={className} onClick={handleLogout} disabled={pending}>
      <LogOut className="mr-2 h-4 w-4" />
      {pending ? "Keluar..." : "Logout"}
    </Button>
  );
}
