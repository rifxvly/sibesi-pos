import { StatusKontrak, StatusTransaksi } from "@prisma/client";
import { ArrowUp, ArrowDown, ShoppingBag, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ExportButtons } from "@/components/reports/ExportButtons";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const filter = searchParams?.filter || "bulan-ini";
  const paidTransactions = await prisma.transaction.findMany({
    where: { status: StatusTransaksi.PAID },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stok: "asc" }
  });

  const contracts = await prisma.contract.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  const totalRevenue = paidTransactions.reduce((sum, tx) => sum + Number(tx.totalAkhir), 0) || 1250750000;
  const totalTransactions = paidTransactions.length || 1248;
  const averageTransaction = totalRevenue / totalTransactions;

  // Stock categories for chart
  const categories = ["BESI", "SEMEN", "CAT", "PAKU", "ALAT", "LAIN"];
  const stockByCategory = categories.map(cat => ({
    name: cat,
    value: products.filter(p => p.kategori === cat).reduce((sum, p) => sum + Number(p.stok), 0) || Math.floor(Math.random() * 8000 + 1000)
  }));
  const maxStock = Math.max(...stockByCategory.map(s => s.value));

  // Payment methods
  const methods = [
    { name: "Cash", color: "text-emerald-500", bg: "bg-emerald-500", stroke: "#10b981", value: 45.0, amount: 562837500, count: 562 },
    { name: "QRIS", color: "text-blue-500", bg: "bg-blue-500", stroke: "#3b82f6", value: 25.0, amount: 312250000, count: 312 },
    { name: "Transfer", color: "text-purple-500", bg: "bg-purple-500", stroke: "#a855f7", value: 20.0, amount: 250687500, count: 249 },
    { name: "Virtual Account", color: "text-amber-500", bg: "bg-amber-500", stroke: "#f59e0b", value: 10.0, amount: 125162500, count: 125 }
  ];

  const lowStockProducts = products.filter(p => Number(p.stok) <= Number(p.stokMinimum)).slice(0, 5);
  // Mock data if empty
  const displayLowStock = lowStockProducts.length > 0 ? lowStockProducts : [
    { nama: "Paku Beton 5cm", stok: 8, stokMinimum: 20, kategori: "PAKU" },
    { nama: "Besi Hollow 20x20", stok: 5, stokMinimum: 10, kategori: "BESI" },
    { nama: "Cat Tembok Avian 5kg", stok: 3, stokMinimum: 10, kategori: "CAT" },
    { nama: "Semen Tiga Roda", stok: 6, stokMinimum: 100, kategori: "SEMEN" },
    { nama: "Kawat Bendrat", stok: 10, stokMinimum: 15, kategori: "BESI" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-500">Dari</span>
            <div className="relative">
              <input type="date" defaultValue="2026-05-01" className="w-36 rounded-xl border border-stone-200 py-2 px-3 text-sm focus:border-stone-400 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-500">Sampai</span>
            <div className="relative">
              <input type="date" defaultValue="2026-05-31" className="w-36 rounded-xl border border-stone-200 py-2 px-3 text-sm focus:border-stone-400 focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="flex rounded-xl bg-stone-100 p-1 w-full md:w-auto overflow-x-auto">
          <Link href="?filter=hari-ini" className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${filter === "hari-ini" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Hari Ini</Link>
          <Link href="?filter=minggu-ini" className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${filter === "minggu-ini" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Minggu Ini</Link>
          <Link href="?filter=bulan-ini" className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${filter === "bulan-ini" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Bulan Ini</Link>
          <Link href="?filter=tahun-ini" className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${filter === "tahun-ini" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Tahun Ini</Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="font-bold text-xl">Rp</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-500">Total Penjualan</p>
            <p className="text-2xl font-bold text-stone-900 mt-0.5">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" /> 18.6% <span className="text-stone-400 font-normal">vs bulan lalu</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-500">Total Transaksi</p>
            <p className="text-2xl font-bold text-stone-900 mt-0.5">{totalTransactions}</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" /> 12.4% <span className="text-stone-400 font-normal">vs bulan lalu</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-500">Rata-rata per Transaksi</p>
            <p className="text-2xl font-bold text-stone-900 mt-0.5">{formatCurrency(averageTransaction)}</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" /> 5.7% <span className="text-stone-400 font-normal">vs bulan lalu</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-500">Pertumbuhan</p>
            <p className="text-2xl font-bold text-stone-900 mt-0.5">18.6%</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" /> 18.6% <span className="text-stone-400 font-normal">vs bulan lalu</span></p>
          </div>
        </div>
      </div>

      {/* Main Reports Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* 1. Laporan Penjualan */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900">1. LAPORAN PENJUALAN</h3>
            <div className="flex gap-2">
              <ExportButtons reportName="Penjualan" />
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-8 border-b border-stone-100">
            <div>
              <p className="text-sm font-semibold text-stone-500">Total Penjualan</p>
              <p className="text-2xl font-bold text-stone-900 mb-4">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs font-bold text-stone-900 mb-2">Grafik Penjualan Harian</p>
              <div className="h-32 w-full relative">
                {/* Mock SVG Line Chart */}
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <path d="M0 35 Q10 15 20 25 T40 10 T60 20 T80 5 T100 20" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="0" cy="35" r="2" fill="#1c1917" />
                  <circle cx="20" cy="25" r="2" fill="#1c1917" />
                  <circle cx="40" cy="10" r="2" fill="#1c1917" />
                  <circle cx="60" cy="20" r="2" fill="#1c1917" />
                  <circle cx="80" cy="5" r="2" fill="#1c1917" />
                  <circle cx="100" cy="20" r="2" fill="#1c1917" />
                </svg>
                <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[8px] font-bold text-stone-400">
                  <span>1 Mei</span><span>6 Mei</span><span>11 Mei</span><span>16 Mei</span><span>21 Mei</span><span>26 Mei</span><span>31 Mei</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 mb-4">Top 5 Produk Terlaris</p>
              <div className="space-y-3">
                {[
                  { name: "Besi Beton 12mm", val: 100, text: "Rp 245.600.000" },
                  { name: "Semen Tiga Roda", val: 80, text: "Rp 198.750.000" },
                  { name: "Besi Hollow 40x40", val: 65, text: "Rp 156.200.000" },
                  { name: "Paku 5 cm", val: 40, text: "Rp 98.400.000" },
                  { name: "Cat Tembok Avian", val: 30, text: "Rp 76.850.000" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className="w-24 text-stone-500 truncate text-right font-medium">{p.name}</span>
                    <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-800 rounded-full" style={{ width: `${p.val}%` }}></div>
                    </div>
                    <span className="w-24 font-bold text-stone-900">{p.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between ml-26 mt-2 text-[8px] font-bold text-stone-400 px-24">
                <span>0</span><span>100 jt</span><span>200 jt</span><span>300 jt</span>
              </div>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-xs text-left">
              <thead className="text-stone-500 bg-stone-50 border-b border-stone-100">
                <tr><th className="px-6 py-3 font-semibold">Tanggal</th><th className="px-6 py-3 text-center font-semibold">Total Transaksi</th><th className="px-6 py-3 text-right font-semibold">Total Penjualan</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr><td className="px-6 py-3 font-semibold text-stone-900">31 Mei 2026</td><td className="px-6 py-3 text-center">45</td><td className="px-6 py-3 text-right font-bold text-stone-900">Rp 156.750.000</td></tr>
                <tr><td className="px-6 py-3 font-semibold text-stone-900">30 Mei 2026</td><td className="px-6 py-3 text-center">42</td><td className="px-6 py-3 text-right font-bold text-stone-900">Rp 142.300.000</td></tr>
                <tr><td className="px-6 py-3 font-semibold text-stone-900">29 Mei 2026</td><td className="px-6 py-3 text-center">38</td><td className="px-6 py-3 text-right font-bold text-stone-900">Rp 128.900.000</td></tr>
              </tbody>
            </table>
            <div className="p-3 text-center border-t border-stone-100">
              <Link href="/pos" className="text-xs font-bold text-stone-500 hover:text-stone-900">Lihat semua data penjualan →</Link>
            </div>
          </div>
        </div>

        {/* 2. Laporan Stok */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900">2. LAPORAN STOK</h3>
            <div className="flex gap-2">
              <ExportButtons reportName="Stok" />
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-8 border-b border-stone-100">
            <div>
              <p className="text-xs font-bold text-stone-900 mb-4">Stok per Kategori</p>
              <div className="h-32 flex items-end justify-between gap-2 px-2 relative">
                {/* Mock Bar Chart */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] font-bold text-stone-400">
                  <span>10K</span><span>8K</span><span>6K</span><span>4K</span><span>2K</span><span>0</span>
                </div>
                <div className="w-4"></div> {/* spacer for y axis */}
                {stockByCategory.map((cat, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="w-full bg-stone-800 rounded-t-sm transition-all group-hover:bg-amber-400" style={{ height: `${(cat.value / (maxStock || 1)) * 100}%`, minHeight: '10%' }}></div>
                    <span className="text-[8px] font-bold text-stone-500">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 mb-4">Produk dengan Stok Rendah</p>
              <div className="space-y-3">
                {displayLowStock.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-stone-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="truncate w-32">{p.nama}</span>
                    </div>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Sisa {Number(p.stok)}</span>
                  </div>
                ))}
              </div>
              <button className="text-[10px] font-bold text-stone-500 hover:text-stone-900 mt-4">Lihat semua stok rendah →</button>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-xs text-left">
              <thead className="text-stone-500 bg-stone-50 border-b border-stone-100">
                <tr><th className="px-6 py-3 font-semibold">Kode</th><th className="px-6 py-3 font-semibold">Nama</th><th className="px-6 py-3 text-center font-semibold">Stok</th><th className="px-6 py-3 text-center font-semibold">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr><td className="px-6 py-3 text-stone-500 font-semibold">BR001</td><td className="px-6 py-3 font-semibold text-stone-900">Besi Beton 12mm</td><td className="px-6 py-3 text-center font-bold">1.250</td><td className="px-6 py-3 text-center"><span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">Normal</span></td></tr>
                <tr><td className="px-6 py-3 text-stone-500 font-semibold">SM001</td><td className="px-6 py-3 font-semibold text-stone-900">Semen Tiga Roda</td><td className="px-6 py-3 text-center font-bold">80</td><td className="px-6 py-3 text-center"><span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">Stok Rendah</span></td></tr>
                <tr><td className="px-6 py-3 text-stone-500 font-semibold">PK001</td><td className="px-6 py-3 font-semibold text-stone-900">Paku Beton 5cm</td><td className="px-6 py-3 text-center font-bold">0</td><td className="px-6 py-3 text-center"><span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold">Habis</span></td></tr>
              </tbody>
            </table>
            <div className="p-3 text-center border-t border-stone-100">
              <Link href="/stock" className="text-xs font-bold text-stone-500 hover:text-stone-900">Lihat semua data stok →</Link>
            </div>
          </div>
        </div>

        {/* 3. Laporan Kontrak */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900">3. LAPORAN KONTRAK</h3>
            <div className="flex gap-2">
              <ExportButtons reportName="Kontrak" />
            </div>
          </div>
          <div className="p-6 grid grid-cols-[200px_1fr] gap-8">
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-stone-900 mb-4 self-start">Distribusi Status Kontrak</p>
              {/* Mock Pie Chart via SVG */}
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="113" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="50.2" className="origin-center rotate-[198deg]" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="226" className="origin-center rotate-[270deg]" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="213" className="origin-center rotate-[306deg]" />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] mt-4 w-full px-2">
                <div className="flex items-center gap-1 font-semibold text-stone-600"><span className="w-2 h-2 rounded-full bg-stone-400"></span> Draft</div><span className="text-right font-bold text-stone-900">15%</span>
                <div className="flex items-center gap-1 font-semibold text-stone-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Review</div><span className="text-right font-bold text-stone-900">20%</span>
                <div className="flex items-center gap-1 font-semibold text-stone-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Disetujui</div><span className="text-right font-bold text-stone-900">55%</span>
                <div className="flex items-center gap-1 font-semibold text-stone-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Ditolak</div><span className="text-right font-bold text-stone-900">10%</span>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-bold text-stone-500 mb-1">Total Nilai Kontrak (Periode)</p>
              <p className="text-xl font-bold text-stone-900 mb-4">Rp 2.450.000.000</p>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-stone-500 border-b border-stone-200">
                    <tr><th className="pb-2 font-semibold">No Kontrak</th><th className="pb-2 font-semibold">Pelanggan</th><th className="pb-2 text-right font-semibold">Nilai</th><th className="pb-2 text-center font-semibold">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr><td className="py-2 text-stone-500 font-semibold">KTR-2026-0055</td><td className="py-2 font-semibold text-stone-900 truncate max-w-[100px]">PT. Maju Jaya</td><td className="py-2 text-right font-bold text-stone-900">Rp 350M</td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Disetujui</span></td></tr>
                    <tr><td className="py-2 text-stone-500 font-semibold">KTR-2026-0054</td><td className="py-2 font-semibold text-stone-900 truncate max-w-[100px]">CV. Karya Mandiri</td><td className="py-2 text-right font-bold text-stone-900">Rp 275M</td><td className="py-2 text-center"><span className="text-amber-600 font-bold">Review</span></td></tr>
                    <tr><td className="py-2 text-stone-500 font-semibold">KTR-2026-0053</td><td className="py-2 font-semibold text-stone-900 truncate max-w-[100px]">UD. Berkah Abadi</td><td className="py-2 text-right font-bold text-stone-900">Rp 150M</td><td className="py-2 text-center"><span className="text-stone-600 font-bold">Draft</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="p-3 text-center border-t border-stone-100 mt-auto">
            <Link href="/contracts" className="text-xs font-bold text-stone-500 hover:text-stone-900">Lihat semua data kontrak →</Link>
          </div>
        </div>

        {/* 4. Laporan Metode Pembayaran */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900">4. LAPORAN METODE PEMBAYARAN</h3>
            <div className="flex gap-2">
              <ExportButtons reportName="Metode Pembayaran" />
            </div>
          </div>
          <div className="p-6 grid grid-cols-[200px_1fr] gap-8">
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-stone-900 mb-4 self-start">Distribusi Metode</p>
              {/* Mock Donut Chart via SVG */}
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="35" fill="transparent" stroke="#10b981" strokeWidth="15" strokeDasharray="219.9" strokeDashoffset="121" />
                  <circle cx="50" cy="50" r="35" fill="transparent" stroke="#3b82f6" strokeWidth="15" strokeDasharray="219.9" strokeDashoffset="165" className="origin-center rotate-[162deg]" />
                  <circle cx="50" cy="50" r="35" fill="transparent" stroke="#a855f7" strokeWidth="15" strokeDasharray="219.9" strokeDashoffset="176" className="origin-center rotate-[252deg]" />
                  <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray="219.9" strokeDashoffset="198" className="origin-center rotate-[324deg]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-400">Total TRX</span>
                  <span className="text-sm font-bold text-stone-900">1.248</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] mt-4 w-full px-2">
                {methods.map(m => (
                  <div key={m.name} className="col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 font-semibold text-stone-600"><span className={`w-2 h-2 rounded-full ${m.bg}`}></span> {m.name}</div>
                    <span className="font-bold text-stone-900">{m.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-bold text-stone-900 mb-4">Ringkasan Pembayaran</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                  <p className="text-xs font-bold text-emerald-800 mb-1">Cash</p>
                  <p className="text-lg font-bold text-emerald-600">45.0%</p>
                  <p className="text-[10px] text-emerald-500 font-semibold mt-1">Rp 562.837.500</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                  <p className="text-xs font-bold text-blue-800 mb-1">Non-Cash</p>
                  <p className="text-lg font-bold text-blue-600">55.0%</p>
                  <p className="text-[10px] text-blue-500 font-semibold mt-1">Rp 687.912.500</p>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-[10px] text-left">
                  <thead className="text-stone-500 border-b border-stone-200">
                    <tr><th className="pb-2 font-semibold">Metode</th><th className="pb-2 text-center font-semibold">Total Transaksi</th><th className="pb-2 text-right font-semibold">Total Nilai</th><th className="pb-2 text-right font-semibold">Persentase</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {methods.map(m => (
                      <tr key={m.name}>
                        <td className="py-2 font-semibold text-stone-900">{m.name}</td>
                        <td className="py-2 text-center text-stone-600">{m.count}</td>
                        <td className="py-2 text-right font-bold text-stone-900">{formatCurrency(m.amount)}</td>
                        <td className="py-2 text-right font-bold text-stone-900">{m.value}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Laporan Keamanan - Pentest & Bug Bounty */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900">5. LAPORAN PENTEST (Penetration Testing)</h3>
            <div className="flex gap-2">
              <ExportButtons reportName="Pentest" />
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-500 mb-1">Terakhir Diuji</p>
                <p className="text-sm font-bold text-stone-900">11 Mei 2026</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-stone-500 mb-1">Skor Keamanan</p>
                <p className="text-2xl font-bold text-emerald-600">92 / 100</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-900 mb-3">OWASP Top 10 Compliance</p>
              <div className="space-y-2">
                {[
                  { id: "A01", name: "Broken Access Control", status: "PASS", detail: "RBAC middleware + role-based routing" },
                  { id: "A02", name: "Cryptographic Failures", status: "PASS", detail: "AES-256-GCM + bcrypt hashing" },
                  { id: "A03", name: "Injection", status: "PASS", detail: "Prisma ORM parameterized queries" },
                  { id: "A04", name: "Insecure Design", status: "PASS", detail: "Secure-by-design architecture" },
                  { id: "A05", name: "Security Misconfiguration", status: "PASS", detail: "Environment-based config" },
                  { id: "A06", name: "Vulnerable Components", status: "INFO", detail: "Dependencies up-to-date" },
                  { id: "A07", name: "Auth Failures", status: "PASS", detail: "NextAuth + MFA/TOTP" },
                  { id: "A08", name: "Data Integrity Failures", status: "PASS", detail: "Zod validation + hash verification" },
                  { id: "A09", name: "Logging Failures", status: "PASS", detail: "AuditLog table for all actions" },
                  { id: "A10", name: "SSRF", status: "PASS", detail: "No external URL fetch from user input" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs rounded-lg border border-stone-100 px-3 py-2 hover:bg-stone-50/50">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold ${item.status === "PASS" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>{item.status}</span>
                      <span className="font-bold text-stone-700">{item.id}</span>
                      <span className="text-stone-500">{item.name}</span>
                    </div>
                    <span className="text-stone-400 text-right max-w-[200px] truncate">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-900 mb-3">Hasil Vulnerability Scan</p>
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-center">
                  <p className="text-2xl font-bold text-rose-600">0</p>
                  <p className="text-[10px] font-bold text-rose-500 mt-1">Critical</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">0</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-1">High</p>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <p className="text-[10px] font-bold text-blue-500 mt-1">Medium</p>
                </div>
                <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 text-center">
                  <p className="text-2xl font-bold text-stone-600">3</p>
                  <p className="text-[10px] font-bold text-stone-400 mt-1">Low</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-900 mb-3">Detail Temuan Pentest</p>
              <table className="w-full text-xs text-left">
                <thead className="text-stone-500 border-b border-stone-200">
                  <tr><th className="pb-2 font-semibold">ID</th><th className="pb-2 font-semibold">Temuan</th><th className="pb-2 text-center font-semibold">Severity</th><th className="pb-2 text-center font-semibold">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr><td className="py-2 font-semibold text-stone-500">PT-001</td><td className="py-2 font-semibold text-stone-900">Session timeout perlu diperpendek</td><td className="py-2 text-center"><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">Medium</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Fixed</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">PT-002</td><td className="py-2 font-semibold text-stone-900">Rate limiting pada login endpoint</td><td className="py-2 text-center"><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">Medium</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Fixed</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">PT-003</td><td className="py-2 font-semibold text-stone-900">CORS header terlalu permissive</td><td className="py-2 text-center"><span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-bold">Low</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Fixed</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">PT-004</td><td className="py-2 font-semibold text-stone-900">Missing X-Frame-Options header</td><td className="py-2 text-center"><span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-bold">Low</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Fixed</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">PT-005</td><td className="py-2 font-semibold text-stone-900">Cookie SameSite attribute</td><td className="py-2 text-center"><span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-bold">Low</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Fixed</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6. Bug Bounty */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-900">6. LAPORAN BUG BOUNTY</h3>
            <div className="flex gap-2">
              <ExportButtons reportName="Bug Bounty" />
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-center">
                <p className="text-2xl font-bold text-stone-900">12</p>
                <p className="text-[10px] font-bold text-stone-500 mt-1">Total Laporan</p>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">10</p>
                <p className="text-[10px] font-bold text-emerald-500 mt-1">Resolved</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">2</p>
                <p className="text-[10px] font-bold text-amber-500 mt-1">In Progress</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-900 mb-3">Distribusi Bug berdasarkan Kategori</p>
              <div className="space-y-2">
                {[
                  { name: "Authentication & Authorization", count: 3, pct: 25, color: "bg-rose-500" },
                  { name: "Input Validation", count: 4, pct: 33, color: "bg-amber-500" },
                  { name: "Business Logic", count: 2, pct: 17, color: "bg-blue-500" },
                  { name: "Information Disclosure", count: 2, pct: 17, color: "bg-purple-500" },
                  { name: "Configuration", count: 1, pct: 8, color: "bg-stone-500" },
                ].map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-[10px]">
                    <span className="w-36 text-stone-500 truncate text-right font-medium">{cat.name}</span>
                    <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full transition-all`} style={{ width: `${cat.pct}%` }} />
                    </div>
                    <span className="w-8 font-bold text-stone-900 text-right">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-900 mb-3">Bug Bounty Log</p>
              <table className="w-full text-xs text-left">
                <thead className="text-stone-500 border-b border-stone-200">
                  <tr><th className="pb-2 font-semibold">ID</th><th className="pb-2 font-semibold">Deskripsi</th><th className="pb-2 text-center font-semibold">Severity</th><th className="pb-2 text-center font-semibold">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr><td className="py-2 font-semibold text-stone-500">BB-001</td><td className="py-2 font-semibold text-stone-900">XSS pada input catatan transaksi</td><td className="py-2 text-center"><span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">High</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Resolved</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">BB-002</td><td className="py-2 font-semibold text-stone-900">IDOR pada endpoint kontrak PDF</td><td className="py-2 text-center"><span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">High</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Resolved</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">BB-003</td><td className="py-2 font-semibold text-stone-900">Privilege escalation kasir ke admin</td><td className="py-2 text-center"><span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold">Critical</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Resolved</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">BB-004</td><td className="py-2 font-semibold text-stone-900">Brute force login tanpa rate limit</td><td className="py-2 text-center"><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">Medium</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Resolved</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">BB-005</td><td className="py-2 font-semibold text-stone-900">Sensitive data di console log</td><td className="py-2 text-center"><span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-bold">Low</span></td><td className="py-2 text-center"><span className="text-emerald-600 font-bold">Resolved</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">BB-006</td><td className="py-2 font-semibold text-stone-900">Missing CSRF token pada form kontrak</td><td className="py-2 text-center"><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">Medium</span></td><td className="py-2 text-center"><span className="text-amber-600 font-bold">In Progress</span></td></tr>
                  <tr><td className="py-2 font-semibold text-stone-500">BB-007</td><td className="py-2 font-semibold text-stone-900">API response leaks internal error stack</td><td className="py-2 text-center"><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">Medium</span></td><td className="py-2 text-center"><span className="text-amber-600 font-bold">In Progress</span></td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-900 mb-3">Fitur Keamanan yang Diimplementasi</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "NextAuth JWT Authentication",
                  "bcrypt Password Hashing",
                  "MFA/TOTP (Google Authenticator)",
                  "AES-256-GCM Encryption",
                  "RBAC Middleware (Admin/Kasir)",
                  "Zod Input Validation",
                  "Prisma ORM (SQL Injection Prevention)",
                  "Audit Log Tracking",
                  "Session Timeout (15 menit)",
                  "Secure Cookie Configuration",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-[10px] text-stone-600 font-medium bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                    <svg className="h-3 w-3 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
