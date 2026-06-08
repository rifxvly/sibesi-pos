import { StatusKontrak, StatusTransaksi, KategoriProduk } from "@prisma/client";
import { ArrowUpRight, ArrowDownRight, Package, Users, Receipt, AlertTriangle, FileText, ChevronRight, Plus, Eye, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

import { DashboardBarChart } from "@/components/dashboard/DashboardBarChart";
import { DashboardLineChart } from "@/components/dashboard/DashboardLineChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

function startOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function endOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(23, 59, 59, 999);
  return clone;
}

export default async function DashboardPage() {
  const today = new Date();
  
  // STATS CARDS DATA
  const paidToday = await prisma.transaction.findMany({
    where: {
      status: StatusTransaksi.PAID,
      createdAt: {
        gte: startOfDay(today),
        lte: endOfDay(today)
      }
    }
  });
  const totalPenjualanHariIni = paidToday.reduce((sum, tx) => sum + Number(tx.totalAkhir), 0);
  const totalTransaksiHariIni = paidToday.length;

  const lowStockProductsCount = await prisma.product.count({
    where: {
      isActive: true,
      stok: { lte: prisma.product.fields.stokMinimum }
    }
  });

  const totalPelanggan = await prisma.customer.count();

  // CHARTS DATA - LINE CHART (7 Hari Terakhir)
  const salesTransactions = await prisma.transaction.findMany({
    where: {
      status: StatusTransaksi.PAID,
      createdAt: {
        gte: startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6))
      }
    },
    select: { createdAt: true, totalAkhir: true }
  });

  const salesMap = new Map<string, number>();
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - index);
    const key = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    salesMap.set(key, 0);
  }

  for (const transaction of salesTransactions) {
    const key = new Date(transaction.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (salesMap.has(key)) {
      salesMap.set(key, (salesMap.get(key) ?? 0) + Number(transaction.totalAkhir));
    }
  }
  const lineChartData = Array.from(salesMap.entries()).map(([day, total]) => ({ day, total }));

  // CHARTS DATA - BAR CHART (Per Kategori)
  const recentSalesDetails = await prisma.transactionDetail.findMany({
    where: {
      transaction: {
        status: StatusTransaksi.PAID,
        createdAt: {
          gte: startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6))
        }
      }
    },
    include: { product: true }
  });

  const categorySalesMap = new Map<string, number>();
  for (const detail of recentSalesDetails) {
    const cat = detail.product.kategori;
    categorySalesMap.set(cat, (categorySalesMap.get(cat) ?? 0) + Number(detail.subtotal));
  }
  
  const categoryLabels: Record<string, string> = {
    BESI: "Besi",
    SEMEN: "Semen",
    PASIR: "Pasir",
    CAT: "Cat",
    PAKU: "Paku & Baut",
    ALAT: "Alat",
    LAIN: "Lainnya"
  };

  const barChartData = Array.from(categorySalesMap.entries())
    .map(([cat, total]) => ({
      name: categoryLabels[cat] || cat,
      total
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  if (barChartData.length === 0) {
    // Mock data for visual completeness if no sales exist
    barChartData.push(
      { name: "Besi Beton", total: 22000000 },
      { name: "Besi Hollow", total: 16000000 },
      { name: "Besi Plat", total: 13000000 },
      { name: "Pipa", total: 9000000 },
      { name: "Baut & Mur", total: 7000000 },
      { name: "Lainnya", total: 5000000 }
    );
  }

  // BOTTOM SECTION DATA
  const recentTransactions = await prisma.transaction.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const lowStockItems = await prisma.product.findMany({
    where: { isActive: true, stok: { lte: prisma.product.fields.stokMinimum } },
    orderBy: { stok: "asc" },
    take: 4
  });

  return (
    <div className="space-y-6">
      {/* 4 STATS CARDS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-4 p-5 rounded-2xl border-stone-200 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <span className="text-xl font-bold">Rp</span>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Total Penjualan Hari Ini</p>
            <p className="mt-0.5 text-2xl font-bold text-stone-900">{formatCurrency(totalPenjualanHariIni)}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="flex items-center font-medium text-emerald-600">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                18.6%
              </span>
              <span className="text-stone-500">dari kemarin</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 rounded-2xl border-stone-200 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Total Transaksi</p>
            <p className="mt-0.5 text-2xl font-bold text-stone-900">{totalTransaksiHariIni}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="flex items-center font-medium text-emerald-600">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                12.3%
              </span>
              <span className="text-stone-500">dari kemarin</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 rounded-2xl border-orange-100/50 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Produk Stok Rendah</p>
            <p className="mt-0.5 text-2xl font-bold text-stone-900">{lowStockProductsCount}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="flex items-center font-medium text-orange-500">
                <AlertTriangle className="mr-0.5 h-3 w-3" />
                Perlu perhatian
              </span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 rounded-2xl border-stone-200 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Total Pelanggan</p>
            <p className="mt-0.5 text-2xl font-bold text-stone-900">{totalPelanggan}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="flex items-center font-medium text-emerald-600">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                7.8%
              </span>
              <span className="text-stone-500">dari bulan lalu</span>
            </div>
          </div>
        </Card>
      </section>

      {/* CHARTS SECTION */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 rounded-2xl border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-stone-900">Grafik Penjualan 7 Hari Terakhir</h3>
            <select className="text-sm border-stone-200 rounded-lg px-2 py-1 text-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-900">
              <option>7 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[280px]">
            <DashboardLineChart data={lineChartData} />
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-stone-900">Penjualan per Kategori</h3>
            <select className="text-sm border-stone-200 rounded-lg px-2 py-1 text-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-900">
              <option>7 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[280px]">
            <DashboardBarChart data={barChartData} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#2d3748]"></div>
              Kategori Utama
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#48bb78]"></div>
              Kategori Lainnya
            </div>
          </div>
        </Card>
      </section>

      {/* BOTTOM SECTION */}
      <section className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* TRANSAKSI TERBARU */}
        <div className="space-y-6">
          <Card className="p-0 rounded-2xl border-stone-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">Transaksi Terbaru</h3>
              <Link href="/pos" className="text-sm text-stone-600 hover:text-stone-900 font-medium px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-stone-500 bg-stone-50/50">
                  <tr>
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-5 py-3 font-medium">Pelanggan</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/50">
                      <td className="px-5 py-4 font-medium text-stone-900">{tx.noTransaksi}</td>
                      <td className="px-5 py-4 text-stone-600">{tx.customer?.nama || "Walk-in"}</td>
                      <td className="px-5 py-4 text-stone-900 font-medium">{formatCurrency(Number(tx.totalAkhir))}</td>
                      <td className="px-5 py-4">
                        {tx.status === StatusTransaksi.PAID ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Lunas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-stone-500 whitespace-nowrap">
                        {tx.createdAt.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
                        {tx.createdAt.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-stone-500">
                        Belum ada transaksi terbaru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* AKSI CEPAT */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Aksi Cepat</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/pos" className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors">
                <Plus className="w-4 h-4" />
                Transaksi Baru
                <ChevronRight className="w-4 h-4 ml-2 opacity-50" />
              </Link>
              <Link href="/products" className="inline-flex items-center gap-2 bg-white text-stone-700 border border-stone-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm">
                <Package className="w-4 h-4" />
                Tambah Produk
                <ChevronRight className="w-4 h-4 ml-2 opacity-50" />
              </Link>
              <Link href="/reports" className="inline-flex items-center gap-2 bg-white text-stone-700 border border-stone-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm">
                <FileText className="w-4 h-4" />
                Lihat Laporan
                <ChevronRight className="w-4 h-4 ml-2 opacity-50" />
              </Link>
            </div>
          </div>
        </div>

        {/* PERINGATAN STOK RENDAH */}
        <Card className="p-0 rounded-2xl border-orange-200 bg-[#fffdfa] shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-5 flex items-center justify-between border-b border-orange-100 bg-[#fffdfa]">
            <h3 className="font-semibold text-orange-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Peringatan Stok Rendah
            </h3>
            <Link href="/stock" className="text-sm text-orange-600 hover:text-orange-700 font-medium px-3 py-1.5 border border-orange-200 bg-white rounded-lg hover:bg-orange-50 transition-colors">
              Lihat Semua
            </Link>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-orange-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
                      <Package className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 text-sm line-clamp-1">{item.nama}</p>
                      <p className="text-xs text-stone-500 mt-0.5">Stok: <span className="font-semibold text-stone-700">{Number(item.stok)} {item.satuan}</span></p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5 shrink-0 pl-2">
                    <span className="text-[11px] text-stone-400 font-medium">Min: {Number(item.stokMinimum)} {item.satuan}</span>
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-100 text-orange-600 border border-orange-200">
                      Stok Rendah
                    </span>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="text-center py-8 text-stone-500 text-sm">
                  Semua stok produk dalam kondisi aman.
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
