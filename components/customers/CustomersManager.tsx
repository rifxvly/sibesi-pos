"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Eye, Edit2, Trash2, X, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

type CustomerType = "PERORANGAN" | "PERUSAHAAN";

type CustomerRecord = {
  id: string;
  nama: string;
  tipe: CustomerType;
  perusahaan: string | null;
  npwp: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  createdAt: string;
  // Mocks for UI based on design
  displayId?: string;
  totalTransaksi?: number;
};

type CustomerForm = {
  nama: string;
  tipe: CustomerType;
  perusahaan: string;
  npwp: string;
  alamat: string;
  telepon: string;
  email: string;
};

const emptyForm: CustomerForm = {
  nama: "",
  tipe: "PERORANGAN",
  perusahaan: "",
  npwp: "",
  alamat: "",
  telepon: "",
  email: ""
};

export function CustomersManager() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"Semua" | "Perorangan" | "Perusahaan">("Semua");
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    try {
      const response = await fetch("/api/customers", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        // Add mocked IDs and Total Transaksi for UI purposes to match mockup
        const enriched = (data as CustomerRecord[]).map((c, i) => ({
          ...c,
          displayId: `CUST-${String(i + 1).padStart(4, "0")}`,
          totalTransaksi: Math.floor(Math.random() * 50000000)
        }));
        setCustomers(enriched);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  const filteredCustomers = useMemo(() => {
    setCurrentPage(1);
    return customers.filter((c) => {
      const matchSearch = `${c.nama} ${c.perusahaan ?? ""} ${c.telepon ?? ""} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "Semua" || 
                        (filterType === "Perorangan" && c.tipe === "PERORANGAN") ||
                        (filterType === "Perusahaan" && c.tipe === "PERUSAHAAN");
      return matchSearch && matchType;
    });
  }, [customers, search, filterType]);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  
  const paginatedCustomers = filteredCustomers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

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

  function openCreateModal() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(customer: CustomerRecord) {
    setForm({
      nama: customer.nama,
      tipe: customer.tipe,
      perusahaan: customer.perusahaan ?? "",
      npwp: customer.npwp ?? "",
      alamat: customer.alamat ?? "",
      telepon: customer.telepon ?? "",
      email: customer.email ?? ""
    });
    setEditingId(customer.id);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        perusahaan: form.tipe === "PERUSAHAAN" ? form.perusahaan : null,
        npwp: form.npwp || null,
        alamat: form.alamat || null,
        telepon: form.telepon || null,
        email: form.email || null
      };

      const response = await fetch(editingId ? `/api/customers/${editingId}` : "/api/customers", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Gagal menyimpan pelanggan");
      }

      setIsModalOpen(false);
      await loadCustomers();
      if (selectedCustomer && editingId === selectedCustomer.id) {
        setSelectedCustomer(null); // Clear selection or we could refetch it
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`Hapus pelanggan ini?`)) return;
    try {
      const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (response.ok) {
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
        await loadCustomers();
      }
    } catch { }
  }

  return (
    <div className="space-y-6">
      {/* Top right button */}
      <div className="flex justify-end hidden lg:flex">
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Pelanggan
        </button>
      </div>

      <div className={`grid gap-6 transition-all duration-300 ${selectedCustomer ? 'xl:grid-cols-[minmax(0,1fr)_380px]' : 'grid-cols-1'}`}>
        
        {/* Left Column: List */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm h-fit">
          <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Cari nama, no HP, email..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-stone-400 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-stone-500">Tipe</span>
              <div className="flex rounded-lg bg-stone-100 p-1">
                <button onClick={() => setFilterType("Semua")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${filterType === "Semua" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Semua</button>
                <button onClick={() => setFilterType("Perorangan")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${filterType === "Perorangan" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Perorangan</button>
                <button onClick={() => setFilterType("Perusahaan")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${filterType === "Perusahaan" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Perusahaan</button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50/50 text-xs font-semibold text-stone-500 border-b border-stone-100">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">Tipe</th>
                  <th className="px-5 py-4">No HP</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4 flex items-center gap-1">NPWP <Info className="h-3 w-3" /></th>
                  <th className="px-5 py-4 font-semibold">Total Transaksi</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center">Memuat...</td></tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center">Belum ada data pelanggan.</td></tr>
                ) : (
                  paginatedCustomers.map(customer => (
                    <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className={`cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'bg-stone-50' : 'hover:bg-stone-50/50'}`}>
                      <td className="px-5 py-4 font-medium text-stone-900">{customer.displayId}</td>
                      <td className="px-5 py-4 font-semibold text-stone-900">{customer.perusahaan || customer.nama}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold border ${customer.tipe === "PERUSAHAAN" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 border-stone-200"}`}>{customer.tipe === "PERUSAHAAN" ? "Perusahaan" : "Perorangan"}</span>
                      </td>
                      <td className="px-5 py-4">{customer.telepon || "-"}</td>
                      <td className="px-5 py-4 text-stone-500">{customer.email || "-"}</td>
                      <td className="px-5 py-4 text-stone-500">{customer.npwp || "-"}</td>
                      <td className="px-5 py-4 font-bold text-stone-900">{formatCurrency(customer.totalTransaksi || 0)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }} className="text-stone-400 hover:text-stone-900"><Eye className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(customer); }} className="text-stone-400 hover:text-stone-900"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="text-stone-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-stone-100 flex items-center justify-between text-sm text-stone-500 bg-stone-50/30">
            <span>Menampilkan {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredCustomers.length)} dari {filteredCustomers.length} pelanggan</span>
            {filteredCustomers.length > 0 && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >&lt;</button>
                {pages.map((page, index) => (
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(page as number)}
                      className={`px-3 py-1 rounded transition-all ${
                        safeCurrentPage === page
                          ? "bg-stone-900 text-white font-bold shadow-sm"
                          : "border border-stone-200 bg-white hover:bg-stone-50 text-stone-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >&gt;</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Details */}
        {selectedCustomer && (
          <div className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm h-fit sticky top-6 animate-in slide-in-from-right-8">
            <div className="p-6 border-b border-stone-100 relative">
              <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X className="h-5 w-5" /></button>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-stone-900 text-white flex items-center justify-center text-xl font-bold">
                  {(selectedCustomer.perusahaan || selectedCustomer.nama).substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{selectedCustomer.perusahaan || selectedCustomer.nama}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-stone-500">{selectedCustomer.displayId}</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border ${selectedCustomer.tipe === "PERUSAHAAN" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 border-stone-200"}`}>{selectedCustomer.tipe === "PERUSAHAAN" ? "Perusahaan" : "Perorangan"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-500 mb-1">Total Transaksi</p>
                  <p className="font-bold text-sm text-stone-900">{formatCurrency(selectedCustomer.totalTransaksi || 0)}</p>
                  <p className="text-[10px] text-stone-400 mt-1">28 Transaksi</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-500 mb-1">Pembelian Terakhir</p>
                  <p className="font-bold text-sm text-stone-900">23 Mei 2026</p>
                  <p className="text-[10px] text-stone-400 mt-1">2 hari yang lalu</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-500 mb-1">Bergabung Sejak</p>
                  <p className="font-bold text-sm text-stone-900">{new Date(selectedCustomer.createdAt).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</p>
                  <p className="text-[10px] text-stone-400 mt-1">1 tahun lalu</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-stone-100">
              <h4 className="text-sm font-bold text-stone-900 mb-4">Informasi Pelanggan</h4>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Nama Perusahaan</span>
                  <span className="font-medium text-stone-900">: {selectedCustomer.perusahaan || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">PIC</span>
                  <span className="font-medium text-stone-900">: {selectedCustomer.nama}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">No HP</span>
                  <span className="font-medium text-stone-900">: {selectedCustomer.telepon || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Email</span>
                  <span className="font-medium text-stone-900">: {selectedCustomer.email || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Alamat</span>
                  <span className="font-medium text-stone-900 leading-relaxed">: {selectedCustomer.alamat || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-stone-500">NPWP</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">: {selectedCustomer.npwp || "-"}</span>
                    {selectedCustomer.npwp && <button className="text-stone-400 hover:text-stone-900"><Eye className="h-3 w-3" /></button>}
                  </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-stone-500">Tipe</span>
                  <div className="flex items-center gap-2">
                    <span>: </span>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold border ${selectedCustomer.tipe === "PERUSAHAAN" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 border-stone-200"}`}>{selectedCustomer.tipe === "PERUSAHAAN" ? "Perusahaan" : "Perorangan"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-stone-900">Riwayat Transaksi Terakhir</h4>
                <button onClick={() => router.push('/reports')} className="text-xs font-semibold text-stone-500 hover:text-stone-900">Lihat Semua</button>
              </div>
              <div className="space-y-3">
                {/* Mock data for transactions */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between text-xs border-b border-stone-50 pb-2 last:border-0">
                    <div>
                      <p className="font-bold text-stone-900">2{4-i} Mei 2026</p>
                      <p className="text-stone-500 mt-0.5">TRX-26052{i}-00{i}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900">Rp {i * 5}.450.000</p>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">Lunas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              <button 
                onClick={() => router.push('/pos')}
                className="w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition flex items-center justify-center gap-2 shadow-sm"
              >
                Buat Transaksi Baru
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">{editingId ? "Edit Pelanggan" : "Tambah Pelanggan"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-900">Tipe Pelanggan</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-700">
                    <input type="radio" checked={form.tipe === "PERORANGAN"} onChange={() => setForm({...form, tipe: "PERORANGAN"})} className="accent-stone-900 w-4 h-4" />
                    Perorangan
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-700">
                    <input type="radio" checked={form.tipe === "PERUSAHAAN"} onChange={() => setForm({...form, tipe: "PERUSAHAAN"})} className="accent-stone-900 w-4 h-4" />
                    Perusahaan
                  </label>
                </div>
              </div>

              {form.tipe === "PERUSAHAAN" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Nama Perusahaan *</label>
                  <input type="text" placeholder="Masukkan nama perusahaan" value={form.perusahaan} onChange={e => setForm({...form, perusahaan: e.target.value})} required className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">{form.tipe === "PERUSAHAAN" ? "PIC" : "Nama Lengkap"} *</label>
                  <input type="text" placeholder={form.tipe === "PERUSAHAAN" ? "Nama PIC" : "Masukkan nama lengkap"} value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">No HP *</label>
                  <input type="text" placeholder="08xxxxxxxxxx" value={form.telepon} onChange={e => setForm({...form, telepon: e.target.value})} required className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900">Email</label>
                <input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900">Alamat *</label>
                <textarea placeholder="Masukkan alamat lengkap" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} required rows={3} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none resize-none"></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900">NPWP</label>
                <div className="relative">
                  <input type="text" placeholder="xx.xxx.xxx.x-xxx.xxx" value={form.npwp} onChange={e => setForm({...form, npwp: e.target.value})} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none pr-10" />
                  <Eye className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                </div>
              </div>

              {error && <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</div>}

              <div className="flex gap-3 pt-2 border-t border-stone-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition disabled:opacity-50">
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
