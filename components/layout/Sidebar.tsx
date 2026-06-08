"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, LayoutDashboard, Package, ShoppingCart, Users, LogOut, Settings, ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

const adminNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/stock", label: "Stok", icon: Boxes },
  { href: "/contracts", label: "Kontrak", icon: ClipboardList },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings }
];

const kasirNavigation = [
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/stock", label: "Stok", icon: Boxes },
  { href: "/customers", label: "Pelanggan", icon: Users }
];

export function Sidebar({
  role,
  username = "Admin"
}: {
  role?: "ADMIN" | "KASIR";
  username?: string;
}) {
  const pathname = usePathname();
  const navigation = role === "KASIR" ? kasirNavigation : adminNavigation;

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] flex-col bg-[#1c1917] lg:flex">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          {/* Custom Hexagon M Logo */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 16L20 22L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 24L20 30L28 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 10V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-bold text-white leading-tight">SiBesi POS</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Toko Besi Persahabatan</p>
        </div>
      </div>

      <div className="px-6 mb-3">
        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Menu</p>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-stone-700 text-white shadow-sm border-l-[3px] border-white"
                  : "text-stone-400 hover:bg-stone-800 hover:text-stone-100 border-l-[3px] border-transparent"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-white" : "text-stone-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-6 pt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-stone-800 bg-[#1c1917] hover:bg-stone-800 transition cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-600 bg-stone-900 text-sm font-bold text-white">
            {username.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{username}</p>
            <p className="text-[10px] text-stone-400 truncate">{role === "KASIR" ? "Kasir" : "Administrator"}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-stone-500 shrink-0" />
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold text-rose-500 transition hover:bg-stone-800"
        >
          <LogOut className="h-5 w-5" /> Keluar
        </button>
      </div>
    </aside>
  );
}
