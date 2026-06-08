"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Eye, FileText, Check, X, Trash2, ArrowRight } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

type CustomerOption = { id: string; nama: string; perusahaan: string | null; alamat: string | null; };
type ProductOption = { id: string; nama: string; kodeBarang: string; satuan: string; hargaJual: number | string; };

type ContractRecord = {
  id: string;
  noKontrak: string;
  status: "DRAFT" | "REVIEW" | "APPROVED" | "REJECTED";
  alamatKirim: string | null;
  totalNilai: number | string | null;
  tempoPembayaran: number | null;
  filePdf: string | null;
  hashValue: string | null;
  createdAt: string;
  catatanAdmin: string | null;
  customer: { nama: string; perusahaan: string | null; alamat: string | null; };
  items: Array<{ id: string; jumlah: number | string; subtotal: number | string; satuan: string; hargaSatuan: number | string; product: { nama: string; kodeBarang: string; } }>;
};

type ContractItemForm = { productId: string; jumlah: string; };

type ContractForm = {
  customerId: string;
  tanggalKontrak: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  catatan: string;
  items: ContractItemForm[];
};

const emptyForm: ContractForm = {
  customerId: "",
  tanggalKontrak: new Date().toISOString().split('T')[0],
  tanggalMulai: new Date().toISOString().split('T')[0],
  tanggalSelesai: "",
  catatan: "",
  items: []
};

export function ContractsManager() {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [form, setForm] = useState<ContractForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [customersRes, productsRes, contractsRes] = await Promise.all([
        fetch("/api/customers", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/contracts", { cache: "no-store" })
      ]);
      const [customersData, productsData, contractsData] = await Promise.all([
        customersRes.json(), productsRes.json(), contractsRes.json()
      ]);
      if (customersRes.ok && productsRes.ok && contractsRes.ok) {
        setCustomers(customersData);
        setProducts(productsData);
        setContracts(contractsData);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchTab = activeTab === "Semua" ||
        (activeTab === "Draft" && c.status === "DRAFT") ||
        (activeTab === "Review" && c.status === "REVIEW") ||
        (activeTab === "Disetujui" && c.status === "APPROVED") ||
        (activeTab === "Ditolak" && c.status === "REJECTED");
      const matchSearch = (c.noKontrak + " " + c.customer.nama + " " + (c.customer.perusahaan || "")).toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [contracts, activeTab, searchQuery]);

  const stats = {
    Draft: contracts.filter(c => c.status === "DRAFT").length,
    Review: contracts.filter(c => c.status === "REVIEW").length,
    Disetujui: contracts.filter(c => c.status === "APPROVED").length,
    Ditolak: contracts.filter(c => c.status === "REJECTED").length,
  };

  const resolvedItems = useMemo(() => {
    return form.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const qty = Number(item.jumlah || 0);
      const price = product ? Number(product.hargaJual) : 0;
      return { ...item, product, subtotal: qty * price };
    });
  }, [form.items, products]);

  const formTotal = resolvedItems.reduce((sum, item) => sum + item.subtotal, 0);

  function addItem() {
    if (!selectedProductId) return;
    if (form.items.some(i => i.productId === selectedProductId)) return;
    setForm(cur => ({ ...cur, items: [...cur.items, { productId: selectedProductId, jumlah: "1" }] }));
    setSelectedProductId("");
  }

  function removeItem(productId: string) {
    setForm(cur => ({ ...cur, items: cur.items.filter(i => i.productId !== productId) }));
  }

  function updateItemQty(productId: string, jumlah: string) {
    setForm(cur => ({ ...cur, items: cur.items.map(i => i.productId === productId ? { ...i, jumlah } : i) }));
  }

  async function handleDecision(contractId: string, status: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/contracts/${contractId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, catatanAdmin: status === "APPROVED" ? "Disetujui" : "Ditolak" })
      });
      if (res.ok) {
        await loadData();
        if (selectedContract?.id === contractId) {
          const updated = await res.json();
          // We can just rely on loadData, but to be safe close or keep open
          setSelectedContract(null);
        }
      }
    } catch { }
  }

  async function handleCreate(isDraft: boolean) {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        customerId: form.customerId,
        alamatKirim: customers.find(c => c.id === form.customerId)?.alamat || "",
        jadwalKirim: form.tanggalMulai,
        tempoPembayaran: 14,
        catatanAdmin: form.catatan,
        items: resolvedItems.filter(i => i.product).map(i => ({
          productId: i.productId,
          jumlah: Number(i.jumlah),
          satuan: i.product!.satuan,
          hargaSatuan: Number(i.product!.hargaJual),
          subtotal: i.subtotal
        })),
        status: isDraft ? "DRAFT" : "REVIEW"
      };

      const res = await fetch("/api/contracts", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal menyimpan kontrak");

      setIsModalOpen(false);
      setForm(emptyForm);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DRAFT": return "text-stone-600 bg-stone-100 border-stone-200";
      case "REVIEW": return "text-amber-600 bg-amber-50 border-amber-200";
      case "APPROVED": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "REJECTED": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "";
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT": return "Draft";
      case "REVIEW": return "Review";
      case "APPROVED": return "Disetujui";
      case "REJECTED": return "Ditolak";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top right button */}
      <div className="flex justify-end hidden lg:flex">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Buat Kontrak Baru
        </button>
      </div>

      <div className={`grid gap-6 transition-all duration-300 ${selectedContract ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : 'grid-cols-1'}`}>

        {/* Left Column: Contract List */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm h-fit">
          <div className="border-b border-stone-100 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setActiveTab("Semua")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === "Semua" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"}`}>Semua</button>
              <button onClick={() => setActiveTab("Draft")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === "Draft" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"}`}>Draft <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded text-[10px]">{stats.Draft}</span></button>
              <button onClick={() => setActiveTab("Review")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === "Review" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"}`}>Review <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px]">{stats.Review}</span></button>
              <button onClick={() => setActiveTab("Disetujui")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === "Disetujui" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"}`}>Disetujui <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">{stats.Disetujui}</span></button>
              <button onClick={() => setActiveTab("Ditolak")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === "Ditolak" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"}`}>Ditolak <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px]">{stats.Ditolak}</span></button>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder="Cari kontrak, pelanggan, atau no kontrak..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-stone-400 focus:outline-none shadow-sm" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50/50 text-xs font-semibold text-stone-500 border-b border-stone-100">
                <tr>
                  <th className="px-5 py-4">No Kontrak</th>
                  <th className="px-5 py-4">Pelanggan</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4 font-semibold">Total Nilai</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center">Memuat...</td></tr>
                ) : filteredContracts.map(contract => (
                  <tr key={contract.id} onClick={() => setSelectedContract(contract)} className={`cursor-pointer transition-colors ${selectedContract?.id === contract.id ? 'bg-stone-50' : 'hover:bg-stone-50/50'}`}>
                    <td className="px-5 py-4 font-medium text-stone-900">{contract.noKontrak}</td>
                    <td className="px-5 py-4 font-semibold text-stone-900">{contract.customer.perusahaan || contract.customer.nama}</td>
                    <td className="px-5 py-4">{new Date(contract.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-4 font-bold text-stone-900">{formatCurrency(Number(contract.totalNilai))}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${getStatusStyle(contract.status)}`}>{getStatusLabel(contract.status)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-stone-400 hover:text-stone-900"><Eye className="h-4 w-4" /></button>
                        <button className="text-stone-400 hover:text-stone-900"><FileText className="h-4 w-4" /></button>
                        {contract.status === "REVIEW" && <button className="text-stone-400 hover:text-emerald-600"><Check className="h-4 w-4" /></button>}
                        {contract.status === "REVIEW" && <button className="text-stone-400 hover:text-rose-600"><X className="h-4 w-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Contract Details */}
        {selectedContract && (
          <div className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm h-fit sticky top-6 animate-in slide-in-from-right-8">
            <div className="flex items-center justify-between border-b border-stone-100 p-5">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-stone-900">{selectedContract.noKontrak}</h3>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${getStatusStyle(selectedContract.status)}`}>{getStatusLabel(selectedContract.status)}</span>
              </div>
              <button onClick={() => setSelectedContract(null)} className="text-stone-400 hover:text-stone-900"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Workflow Status */}
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 w-10 rounded-full bg-stone-900 text-white flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                  <span className="text-xs font-bold text-stone-900">Draft</span>
                </div>
                <div className={`h-px flex-1 ${selectedContract.status !== 'DRAFT' ? 'bg-stone-900' : 'bg-stone-200'} mx-2`}></div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedContract.status === 'REVIEW' ? 'bg-amber-100 text-amber-600 border border-amber-200' : selectedContract.status === 'APPROVED' || selectedContract.status === 'REJECTED' ? 'bg-stone-900 text-white' : 'bg-stone-50 border border-stone-200 text-stone-400'}`}><Eye className="h-4 w-4" /></div>
                  <span className={`text-xs font-bold ${selectedContract.status !== 'DRAFT' ? 'text-stone-900' : 'text-stone-400'}`}>Review</span>
                </div>
                <div className={`h-px flex-1 ${selectedContract.status === 'APPROVED' || selectedContract.status === 'REJECTED' ? 'bg-stone-900' : 'bg-stone-200'} mx-2`}></div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedContract.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : selectedContract.status === 'REJECTED' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-stone-50 border border-stone-200 text-stone-400'}`}>
                    {selectedContract.status === 'REJECTED' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs font-bold ${selectedContract.status === 'APPROVED' ? 'text-emerald-600' : selectedContract.status === 'REJECTED' ? 'text-rose-600' : 'text-stone-400'}`}>
                    {selectedContract.status === 'REJECTED' ? 'Rejected' : 'Approved'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-stone-500 mb-1">Pelanggan</p>
                  <p className="font-semibold text-stone-900">{selectedContract.customer.perusahaan || selectedContract.customer.nama}</p>
                  <p className="text-stone-500 mt-1">{selectedContract.alamatKirim || selectedContract.customer.alamat}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Tanggal Kontrak</p>
                    <p className="font-semibold text-stone-900">{new Date(selectedContract.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-bold text-stone-900 mb-3">Item Kontrak</h4>
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                      <tr>
                        <th className="p-2 font-semibold">No</th>
                        <th className="p-2 font-semibold">Material</th>
                        <th className="p-2 font-semibold">Qty</th>
                        <th className="p-2 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedContract.items.map((item, i) => (
                        <tr key={item.id}>
                          <td className="p-2 text-stone-500">{i + 1}</td>
                          <td className="p-2 font-medium text-stone-900">{item.product?.nama || '-'}</td>
                          <td className="p-2">{item.jumlah} {item.satuan}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(Number(item.subtotal))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-50 border-t border-stone-200 font-bold">
                      <tr>
                        <td colSpan={3} className="p-2 text-right">Total Nilai</td>
                        <td className="p-2 text-right text-sm">{formatCurrency(Number(selectedContract.totalNilai))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedContract.catatanAdmin && (
                <div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Catatan</h4>
                  <p className="text-sm text-stone-500">{selectedContract.catatanAdmin}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex items-center justify-between gap-3">
              <button onClick={() => window.open(`/api/contracts/${selectedContract.id}/pdf`, "_blank")} className="px-4 py-2 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl shadow-sm hover:bg-stone-50 transition">Generate PDF</button>
              {selectedContract.status === "REVIEW" && (
                <div className="flex gap-2">
                  <button onClick={() => handleDecision(selectedContract.id, "REJECTED")} className="px-4 py-2 text-sm font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl shadow-sm hover:bg-rose-50 transition">Tolak</button>
                  <button onClick={() => handleDecision(selectedContract.id, "APPROVED")} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-sm hover:bg-emerald-700 transition">Setujui</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 lg:p-12 animate-in fade-in duration-200">
          <div className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-stone-100 p-6 bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900">Buat Kontrak Baru</h2>
              <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
                <div className="flex items-center gap-2 text-stone-900"><span className="h-6 w-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">1</span> Informasi Kontrak</div>
                <div className="h-px w-8 bg-stone-300"></div>
                <div className="flex items-center gap-2 text-stone-400"><span className="h-6 w-6 rounded-full bg-stone-200 flex items-center justify-center text-xs">2</span> Detail Item</div>
                <div className="h-px w-8 bg-stone-300"></div>
                <div className="flex items-center gap-2 text-stone-400"><span className="h-6 w-6 rounded-full bg-stone-200 flex items-center justify-center text-xs">3</span> Review & Kirim</div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900"><X className="h-6 w-6" /></button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left Form */}
              <div className="w-full lg:w-[400px] p-6 overflow-y-auto border-r border-stone-100 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Pilih Pelanggan *</label>
                  <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3.5 py-3 text-sm focus:border-stone-900 focus:outline-none font-medium bg-white">
                    <option value="">Cari pelanggan...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.perusahaan || c.nama}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Tanggal Kontrak *</label>
                  <input type="date" value={form.tanggalKontrak} onChange={e => setForm({ ...form, tanggalKontrak: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3.5 py-3 text-sm focus:border-stone-900 focus:outline-none font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-900">Tanggal Mulai *</label>
                    <input type="date" value={form.tanggalMulai} onChange={e => setForm({ ...form, tanggalMulai: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3.5 py-3 text-sm focus:border-stone-900 focus:outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-900">Tanggal Selesai *</label>
                    <input type="date" value={form.tanggalSelesai} onChange={e => setForm({ ...form, tanggalSelesai: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3.5 py-3 text-sm focus:border-stone-900 focus:outline-none font-medium" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Catatan</label>
                  <textarea rows={4} value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} placeholder="Tulis catatan kontrak (opsional)..." className="w-full rounded-xl border border-stone-200 px-3.5 py-3 text-sm focus:border-stone-900 focus:outline-none font-medium resize-none"></textarea>
                </div>
              </div>

              {/* Right Items */}
              <div className="flex-1 p-6 flex flex-col bg-stone-50/50 overflow-hidden">
                <h3 className="text-sm font-bold text-stone-900 mb-3">Item Kontrak</h3>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full rounded-xl border border-stone-200 py-3 pl-10 pr-4 text-sm focus:border-stone-900 focus:outline-none font-medium bg-white appearance-none">
                      <option value="">Cari produk...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={addItem} className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 shadow-sm">Tambah Item</button>
                </div>

                <div className="flex-1 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-xs font-semibold text-stone-500 border-b border-stone-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Produk</th>
                        <th className="px-4 py-3 w-24">Qty</th>
                        <th className="px-4 py-3">Satuan</th>
                        <th className="px-4 py-3 text-right">Harga Satuan</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {resolvedItems.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-500">Belum ada item ditambahkan.</td></tr>
                      ) : resolvedItems.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-semibold text-stone-900">{item.product?.nama}</td>
                          <td className="px-4 py-3"><input type="number" min="1" value={item.jumlah} onChange={e => updateItemQty(item.productId, e.target.value)} className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-center text-sm font-medium focus:outline-none focus:border-stone-400" /></td>
                          <td className="px-4 py-3 text-stone-500">{item.product?.satuan}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(item.product?.hargaJual || 0))}</td>
                          <td className="px-4 py-3 text-right font-bold text-stone-900">{formatCurrency(item.subtotal)}</td>
                          <td className="px-4 py-3 text-center"><button onClick={() => removeItem(item.productId)} className="text-rose-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col items-end gap-1 text-sm bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between w-64 text-stone-500"><p>Subtotal</p><p className="font-semibold text-stone-900">{formatCurrency(formTotal)}</p></div>
                  <div className="flex justify-between w-64 text-lg font-bold text-stone-900 pt-2 border-t border-stone-100"><p>Total Nilai</p><p>{formatCurrency(formTotal)}</p></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-stone-100 p-6 flex items-center justify-between bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded-xl transition">Batal</button>
              <div className="flex gap-3">
                <button onClick={() => handleCreate(true)} disabled={saving || resolvedItems.length === 0} className="px-6 py-3 text-sm font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl shadow-sm transition disabled:opacity-50">Simpan sebagai Draft</button>
                <button onClick={() => handleCreate(false)} disabled={saving || resolvedItems.length === 0} className="px-6 py-3 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-sm transition disabled:opacity-50">Kirim untuk Review</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
