"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";

export function ProfileMenu({
  user
}: {
  user: {
    username: string;
    role: "ADMIN" | "KASIR";
    email?: string | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setPending(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2.5 rounded-full px-2 py-1.5 transition-colors hover:bg-stone-100"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-stone-600">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold text-stone-900">{user.username}</span>
        <ChevronDown className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-3 w-72 rounded-3xl border border-stone-200 bg-white p-3 shadow-lg">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Profile</p>
            <p className="mt-2 text-base font-semibold text-stone-900">{user.username}</p>
            <p className="mt-1 text-sm text-stone-600">{user.email ?? "Akun internal SiBesi POS"}</p>
            <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              {user.role === "ADMIN" ? "Admin Operasional" : "Kasir Aktif"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={pending}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{pending ? "Keluar..." : "Logout"}</span>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
