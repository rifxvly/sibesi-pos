"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Box, LayoutGrid, List as ListIcon, X } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { productCategories } from "@/lib/catalog";

type ProductRecord = {
  id: string;
  kodeBarang: string;
  nama: string;
  kategori: (typeof productCategories)[number];
  satuan: string;
  hargaJual: number | string;
  hargaPokok: number | string | null;
  stok: number | string;
  stokMinimum: number | string;
  isActive: boolean;
};

type ProductForm = {
  kodeBarang: string;
  nama: string;
  kategori: (typeof productCategories)[number];
  satuan: string;
  hargaJual: string;
  hargaPokok: string;
  stok: string;
  stokMinimum: string;
};

const emptyForm: ProductForm = {
  kodeBarang: "",
  nama: "",
  kategori: "BESI",
  satuan: "batang",
  hargaJual: "",
  hargaPokok: "",
  stok: "",
  stokMinimum: ""
};

function toForm(product: ProductRecord): ProductForm {
  return {
    kodeBarang: product.kodeBarang,
    nama: product.nama,
    kategori: product.kategori,
    satuan: product.satuan,
    hargaJual: String(product.hargaJual),
    hargaPokok: product.hargaPokok ? String(product.hargaPokok) : "",
    stok: String(product.stok),
    stokMinimum: String(product.stokMinimum)
  };
}

export function ProductsManager() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("Nama (A-Z)");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal memuat produk.");
        return;
      }
      setProducts(data as ProductRecord[]);
    } catch {
      setError("Produk belum berhasil dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    setCurrentPage(1); // Reset page on filter
    const filtered = products.filter((product) => {
      const matchSearch = `${product.nama} ${product.kodeBarang}`.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "Semua" || product.kategori === filterCategory;
      return matchSearch && matchCat;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "Harga Tertinggi") {
        return Number(b.hargaJual) - Number(a.hargaJual);
      } else if (sortBy === "Harga Terendah") {
        return Number(a.hargaJual) - Number(b.hargaJual);
      }
      // Default: Nama (A-Z)
      return a.nama.localeCompare(b.nama);
    });
  }, [products, search, filterCategory, sortBy]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // Generate page numbers
  let pages: (number | string)[] = [];
  if (totalPages <= 5) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (safeCurrentPage <= 3) {
      pages = [1, 2, 3, 4, "...", totalPages];
    } else if (safeCurrentPage >= totalPages - 2) {
      pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
    }
  }

  function openAddModal() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: ProductRecord) {
    setForm(toForm(product));
    setEditingId(product.id);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        hargaJual: Number(form.hargaJual),
        hargaPokok: form.hargaPokok ? Number(form.hargaPokok) : null,
        stok: Number(form.stok),
        stokMinimum: Number(form.stokMinimum)
      };

      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan produk.");
        return;
      }

      closeModal();
      await loadProducts();
    } catch {
      setError("Terjadi kendala saat menyimpan produk.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: ProductRecord) {
    if (!window.confirm(`Hapus ${product.nama}?`)) return;
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (response.ok) await loadProducts();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top right button */}
      <div className="flex justify-end">
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-stone-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Cari produk berdasarkan nama atau kode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm text-stone-900 focus:border-stone-400 focus:outline-none shadow-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Kategori</span>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:outline-none min-w-[120px]"
              >
                <option value="Semua">Semua</option>
                {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Urutkan</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:outline-none min-w-[140px]"
              >
                <option value="Nama (A-Z)">Nama (A-Z)</option>
                <option value="Harga Tertinggi">Harga Tertinggi</option>
                <option value="Harga Terendah">Harga Terendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/50 text-xs font-semibold text-stone-500 border-b border-stone-100">
              <tr>
                <th className="px-5 py-4">Kode</th>
                <th className="px-5 py-4">Nama</th>
                <th className="px-5 py-4">Harga Jual</th>
                <th className="px-5 py-4 text-center">Stok</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-stone-500">Memuat produk...</td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-stone-500">Belum ada produk yang cocok dengan pencarian.</td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const stok = Number(product.stok);
                  const minStok = Number(product.stokMinimum);
                  const isLowStock = stok <= minStok;
                  return (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-stone-900">{product.kodeBarang}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-900">{product.nama}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{product.kategori}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone-900">
                        {formatCurrency(Number(product.hargaJual))}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-semibold ${isLowStock ? "text-amber-600" : "text-emerald-600"}`}>
                          {stok} {product.satuan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {product.isActive ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 border border-rose-100">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 text-sm text-stone-500">
          <p>Menampilkan {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProducts.length)} dari {filteredProducts.length} produk</p>
          {filteredProducts.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-50 text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              
              {pages.map((page, index) => (
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="text-stone-400 px-1">...</span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                      safeCurrentPage === page
                        ? "bg-stone-900 text-white font-semibold shadow-sm"
                        : "hover:bg-stone-50 font-medium text-stone-600"
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-50 text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">{editingId ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={closeModal} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</div>}
              
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Kode Produk <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.kodeBarang} onChange={e => setForm({...form, kodeBarang: e.target.value})} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Nama Produk <span className="text-rose-500">*</span></label>
                  <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500">Kategori <span className="text-rose-500">*</span></label>
                <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value as any})} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900 bg-white">
                  {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Harga Beli <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-stone-500">Rp</span>
                    <input type="number" value={form.hargaPokok} onChange={e => setForm({...form, hargaPokok: e.target.value})} className="w-full rounded-xl border border-stone-200 pl-10 pr-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Harga Jual <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-stone-500">Rp</span>
                    <input type="number" value={form.hargaJual} onChange={e => setForm({...form, hargaJual: e.target.value})} className="w-full rounded-xl border border-stone-200 pl-10 pr-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Stok Minimum <span className="text-rose-500">*</span></label>
                  <input type="number" value={form.stokMinimum} onChange={e => setForm({...form, stokMinimum: e.target.value})} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Stok Awal <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input type="number" value={form.stok} onChange={e => setForm({...form, stok: e.target.value})} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 pr-16 text-sm focus:border-stone-900 focus:outline-none font-medium text-stone-900" required />
                    <span className="absolute right-3.5 top-2.5 text-sm text-stone-400">batang</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
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
