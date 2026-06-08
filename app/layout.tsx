import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SiBesi POS",
  description: "Sistem Informasi Besi Point of Sale untuk Toko Besi Persahabatan."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
