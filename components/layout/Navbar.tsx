"use client";

import { usePathname } from "next/navigation";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pos": "POS",
  "/products": "Produk",
  "/stock": "Manajemen Stok",
  "/contracts": "Kontrak",
  "/customers": "Pelanggan",
  "/reports": "Laporan",
  "/settings": "Pengaturan"
};

export function Navbar({
  user
}: {
  user?: {
    username: string;
    role: "ADMIN" | "KASIR";
    email?: string | null;
  };
}) {
  const pathname = usePathname();
  // Get main route name
  const pageTitle = routeNames[pathname] || "SiBesi POS";
  
  // Format current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-[#fafafa] px-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{pageTitle}</h1>
        {pathname === "/pos" ? (
          <p className="flex items-center gap-1.5 text-sm text-stone-500 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Tekan / untuk mencari produk
          </p>
        ) : pathname === "/products" ? (
          <p className="text-sm text-stone-500 mt-1">Kelola semua data produk</p>
        ) : pathname === "/stock" ? (
          <p className="text-sm text-stone-500 mt-1">Kelola stok produk dan pergerakan stok</p>
        ) : pathname === "/contracts" ? (
          <p className="text-sm text-stone-500 mt-1">Kelola kontrak penjualan dan kesepakatan dengan pelanggan</p>
        ) : pathname === "/customers" ? (
          <p className="text-sm text-stone-500 mt-1">Kelola data pelanggan toko</p>
        ) : pathname === "/reports" ? (
          <p className="text-sm text-stone-500 mt-1">Pantau performa bisnis Anda</p>
        ) : pathname === "/settings" ? (
          <p className="text-sm text-stone-500 mt-1">Kelola pengaturan akun, toko, dan sistem</p>
        ) : (
          <p className="text-sm text-stone-500 mt-1">{formattedDate}</p>
        )}
      </div>
      {user ? <ProfileMenu user={user} /> : null}
    </header>
  );
}
