"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search, Calendar, ChevronLeft, ChevronRight, X, ArrowDownRight, ArrowUpRight, Download } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

type ProductStock = {
  id: string;
  kodeBarang: string;
  nama: string;
  kategori: string;
  satuan: string;
  stok: number | string;
  stokMinimum: number | string;
  hargaPokok?: number | string | null;
};

type HistoryEntry = {
  id: string;
  tanggal: string;
  produk: string;
  tipe: "IN" | "OUT";
  jumlah: string;
  stokSebelum: number;
  stokSesudah: number;
  alasan: string;
  user: string;
};

export function StockManager() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    try {
      const response = await fetch("/api/stock", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        setProducts(data as ProductStock[]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    setCurrentProductsPage(1); // Reset page on filter
    return products.filter((product) => {
      const haystack = `${product.nama} ${product.kodeBarang} ${product.kategori}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [products, search]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => Number(product.stok) <= Number(product.stokMinimum))
      .sort((a, b) => Number(a.stok) - Number(b.stok));
  }, [products]);

  const totalProducts = products.length;
  // Mock total value if hargaPokok is not available
  const totalValue = products.reduce((sum, p) => sum + (Number(p.stok) * (Number(p.hargaPokok) || 15000)), 0);

  function openModal(product: ProductStock) {
    setSelectedProduct(product);
    setAdjustType("IN");
    setAdjustAmount("");
    setAdjustReason("");
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSaveAdjustment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch("/api/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          jumlah: Number(adjustAmount),
          tipe: adjustType,
          keterangan: adjustReason || `${adjustType === "IN" ? "Penambahan" : "Pengurangan"} stok manual`
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menyimpan");
      }
      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Mock History Data
  const historyData: HistoryEntry[] = [
    { id: "1", tanggal: "20/05/2026 14:32", produk: "Semen Dynamix 50kg (SEM-DYN-50)", tipe: "IN", jumlah: "+10 zak", stokSebelum: 32, stokSesudah: 42, alasan: "Pembelian dari Supplier", user: "Admin" },
    { id: "2", tanggal: "20/05/2026 10:15", produk: "Besi Beton Ulir 10mm (BBU-10)", tipe: "OUT", jumlah: "-3 batang", stokSebelum: 88, stokSesudah: 85, alasan: "Penjualan POS #TRX-250520-0086", user: "Kasir 1" },
    { id: "3", tanggal: "19/05/2026 16:45", produk: "Palu Besi 16 Oz (PALU-16OZ)", tipe: "IN", jumlah: "+5 pcs", stokSebelum: 10, stokSesudah: 15, alasan: "Retur dari Customer", user: "Admin" },
    { id: "4", tanggal: "19/05/2026 09:22", produk: "Kawat Bendrat BWG 18 (KAWAT-18)", tipe: "OUT", jumlah: "-2 kg", stokSebelum: 2, stokSesudah: 0, alasan: "Rusak / Tidak Layak Jual", user: "Gudang" },
    { id: "5", tanggal: "18/05/2026 11:03", produk: "Cat Dulux Catylac 5kg (CAT-DLX-5)", tipe: "IN", jumlah: "+4 kaleng", stokSebelum: 5, stokSesudah: 9, alasan: "Pembelian dari Supplier", user: "Admin" },
    // Mock additional entries for pagination demonstration
    { id: "6", tanggal: "17/05/2026 08:30", produk: "Paku Beton 5cm", tipe: "IN", jumlah: "+10 box", stokSebelum: 10, stokSesudah: 20, alasan: "Pembelian", user: "Admin" },
    { id: "7", tanggal: "16/05/2026 14:20", produk: "Pasir Cor Premium", tipe: "OUT", jumlah: "-200 kg", stokSebelum: 1000, stokSesudah: 800, alasan: "Penjualan", user: "Kasir 1" },
  ];

  // Pagination Logic
  const PRODUCTS_PER_PAGE = 10;
  const HISTORY_PER_PAGE = 5;

  const totalProductsPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safeCurrentProductsPage = Math.min(Math.max(1, currentProductsPage), totalProductsPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentProductsPage - 1) * PRODUCTS_PER_PAGE,
    safeCurrentProductsPage * PRODUCTS_PER_PAGE
  );

  const totalHistoryPages = Math.max(1, Math.ceil(historyData.length / HISTORY_PER_PAGE));
  const safeCurrentHistoryPage = Math.min(Math.max(1, currentHistoryPage), totalHistoryPages);
  const paginatedHistory = historyData.slice(
    (safeCurrentHistoryPage - 1) * HISTORY_PER_PAGE,
    safeCurrentHistoryPage * HISTORY_PER_PAGE
  );

  function getPagesArray(current: number, total: number) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, "...", total];
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  }

  const productsPages = getPagesArray(safeCurrentProductsPage, totalProductsPages);
  const historyPages = getPagesArray(safeCurrentHistoryPage, totalHistoryPages);

  function handleExportCSV() {
    const headers = ["Tanggal", "Produk", "Tipe", "Jumlah", "Stok Sebelum", "Stok Sesudah", "Alasan", "User"];
    const rows = historyData.map(entry => [
      entry.tanggal,
      `"${entry.produk}"`,
      entry.tipe,
      `"${entry.jumlah}"`,
      entry.stokSebelum,
      entry.stokSesudah,
      `"${entry.alasan}"`,
      entry.user
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `riwayat_stok_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="flex justify-end gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm w-48 flex flex-col justify-center">
          <p className="text-xs font-semibold text-stone-500">Total Produk</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{totalProducts}</p>
          <p className="text-[10px] text-stone-400 mt-1">Semua produk terdaftar</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm w-64 flex flex-col justify-center">
          <p className="text-xs font-semibold text-stone-500">Total Nilai Stok</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{formatCurrency(totalValue)}</p>
          <p className="text-[10px] text-stone-400 mt-1">Berdasarkan harga beli</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        
        {/* Left Column: Stok Saat Ini */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 p-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">Stok Saat Ini</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50/50 text-xs font-semibold text-stone-500 border-b border-stone-100">
                <tr>
                  <th className="px-5 py-4">Kode</th>
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4 text-center">Kategori</th>
                  <th className="px-5 py-4 text-center">Stok Saat Ini</th>
                  <th className="px-5 py-4 text-center">Stok Minimum</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-stone-500">Memuat...</td></tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-stone-500">Tidak ada produk.</td></tr>
                ) : paginatedProducts.map(product => {
                  const stok = Number(product.stok);
                  const min = Number(product.stokMinimum);
                  const status = stok === 0 ? "Habis" : stok <= min ? "Stok Rendah" : "Normal";
                  const statusColor = status === "Habis" ? "text-rose-600 bg-rose-50 border-rose-100" : status === "Stok Rendah" ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100";
                  
                  return (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-stone-900">{product.kodeBarang}</td>
                      <td className="px-5 py-4 font-semibold text-stone-900">{product.nama}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{product.kategori}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-semibold ${status !== "Normal" ? (status === "Habis" ? "text-rose-600" : "text-amber-600") : "text-emerald-600"}`}>
                          {stok} {product.satuan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">{min} {product.satuan}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          onClick={() => openModal(product)}
                          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          Sesuaikan Stok
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Footer Pagination */}
          <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
            <p>Menampilkan {(safeCurrentProductsPage - 1) * PRODUCTS_PER_PAGE + 1}-{Math.min(safeCurrentProductsPage * PRODUCTS_PER_PAGE, filteredProducts.length)} dari {filteredProducts.length} produk</p>
            {filteredProducts.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentProductsPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentProductsPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-50 text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {productsPages.map((page, i) => (
                  page === "..." ? (
                    <span key={`p-ell-${i}`} className="text-stone-400 px-1">...</span>
                  ) : (
                    <button
                      key={`p-page-${page}`}
                      onClick={() => setCurrentProductsPage(page as number)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        safeCurrentProductsPage === page
                          ? "bg-stone-900 text-white font-semibold shadow-sm"
                          : "hover:bg-stone-50 font-medium text-stone-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  onClick={() => setCurrentProductsPage(prev => Math.min(totalProductsPages, prev + 1))}
                  disabled={safeCurrentProductsPage === totalProductsPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-50 text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Peringatan Stok Rendah */}
        <div className="flex flex-col rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-amber-100 p-5 bg-white rounded-t-2xl">
            <h3 className="flex items-center gap-2 text-base font-bold text-amber-600">
              <AlertTriangle className="h-5 w-5" /> Peringatan Stok Rendah
            </h3>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">{lowStockProducts.length} Produk</span>
          </div>
          
          <div className="p-4 space-y-3 bg-white">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">Semua stok aman.</p>
            ) : (
              lowStockProducts.slice(0, 5).map(product => {
                const stok = Number(product.stok);
                const isHabis = stok === 0;
                return (
                  <div key={product.id} className="flex items-center gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-stone-100 p-2 flex items-center justify-center opacity-50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">{product.nama}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="text-stone-500">Stok: <span className={`font-semibold ${isHabis ? 'text-rose-600' : 'text-amber-600'}`}>{stok} {product.satuan}</span></span>
                        <span className="text-stone-300">|</span>
                        <span className="text-stone-500">Min: {product.stokMinimum} {product.satuan}</span>
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-bold ${isHabis ? 'text-rose-500' : 'text-amber-500'}`}>
                        {isHabis ? "Habis" : "Stok Rendah"}
                      </span>
                    </div>
                    <button 
                      onClick={() => openModal(product)}
                      className="shrink-0 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
                    >
                      Sesuaikan
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t border-amber-100 bg-white p-3 rounded-b-2xl">
            <button className="flex w-full items-center justify-between px-2 text-sm font-semibold text-stone-700 hover:text-stone-900">
              Lihat semua produk <ArrowDownRight className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Riwayat Pergerakan Stok */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 p-5">
          <h2 className="text-lg font-bold text-stone-900">Riwayat Pergerakan Stok</h2>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Tanggal</span>
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 bg-white shadow-sm">
                <span className="text-sm text-stone-900">01/05/2026 - 20/05/2026</span>
                <Calendar className="h-4 w-4 text-stone-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Produk</span>
              <select className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 bg-white shadow-sm focus:outline-none min-w-[200px]">
                <option>Semua Produk</option>
              </select>
            </div>
            <div className="ml-auto">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 shadow-sm transition-colors"
              >
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/50 text-xs font-semibold text-stone-500 border-b border-stone-100">
              <tr>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Produk</th>
                <th className="px-5 py-4 text-center">Tipe</th>
                <th className="px-5 py-4 text-center">Jumlah</th>
                <th className="px-5 py-4 text-center">Stok Sebelum</th>
                <th className="px-5 py-4 text-center">Stok Sesudah</th>
                <th className="px-5 py-4">Alasan</th>
                <th className="px-5 py-4">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedHistory.map(entry => (
                <tr key={entry.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-stone-900">{entry.tanggal}</td>
                  <td className="px-5 py-4 font-medium text-stone-900">{entry.produk}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${entry.tipe === 'IN' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                      {entry.tipe === 'IN' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />} {entry.tipe}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-center font-bold ${entry.tipe === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>{entry.jumlah}</td>
                  <td className="px-5 py-4 text-center">{entry.stokSebelum} {entry.jumlah.split(" ")[1]}</td>
                  <td className="px-5 py-4 text-center">{entry.stokSesudah} {entry.jumlah.split(" ")[1]}</td>
                  <td className="px-5 py-4 text-stone-500">{entry.alasan}</td>
                  <td className="px-5 py-4">{entry.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
          <p>Menampilkan {(safeCurrentHistoryPage - 1) * HISTORY_PER_PAGE + 1}-{Math.min(safeCurrentHistoryPage * HISTORY_PER_PAGE, historyData.length)} dari {historyData.length} transaksi</p>
          {historyData.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentHistoryPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentHistoryPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-50 text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {historyPages.map((page, i) => (
                page === "..." ? (
                  <span key={`h-ell-${i}`} className="text-stone-400 px-1">...</span>
                ) : (
                  <button
                    key={`h-page-${page}`}
                    onClick={() => setCurrentHistoryPage(page as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                      safeCurrentHistoryPage === page
                        ? "bg-stone-900 text-white font-semibold shadow-sm"
                        : "hover:bg-stone-50 font-medium text-stone-600"
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              <button 
                onClick={() => setCurrentHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                disabled={safeCurrentHistoryPage === totalHistoryPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-50 text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">Sesuaikan Stok</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-6">
              {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-stone-900 mb-2">1. Pilih Produk</p>
                  <div className="rounded-xl border border-stone-200 px-3.5 py-3 text-sm font-semibold text-stone-900 bg-stone-50">
                    {selectedProduct.kodeBarang} - {selectedProduct.nama}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-stone-900 mb-2">2. Informasi Stok</p>
                  <div className="rounded-xl border border-stone-200 px-3.5 py-3 bg-stone-50">
                    <p className="text-xs text-stone-500 mb-1">Stok Saat Ini</p>
                    <p className="text-sm font-bold text-stone-900">{selectedProduct.stok} {selectedProduct.satuan}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-900 mb-2">3. Tipe Penyesuaian</p>
                  <div className="flex gap-4">
                    <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3 transition hover:bg-stone-50">
                      <input type="radio" name="tipe" checked={adjustType === "IN"} onChange={() => setAdjustType("IN")} className="accent-stone-900" />
                      <span className="text-sm font-semibold text-emerald-600">IN (Tambah)</span>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3 transition hover:bg-stone-50">
                      <input type="radio" name="tipe" checked={adjustType === "OUT"} onChange={() => setAdjustType("OUT")} className="accent-stone-900" />
                      <span className="text-sm font-semibold text-rose-600">OUT (Kurang)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-900 mb-2">4. Jumlah</p>
                  <div className="relative">
                    <input type="number" min="1" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="Masukkan jumlah" className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 pr-16 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" required />
                    <span className="absolute right-3.5 top-2.5 text-sm text-stone-400 font-medium">{selectedProduct.satuan}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-900 mb-2">5. Alasan</p>
                  <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Catatan tambahan (opsional)" className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
