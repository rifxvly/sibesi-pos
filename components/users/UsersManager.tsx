"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Eye, Edit2, Trash2, X, Shield, ShieldOff } from "lucide-react";

type UserRole = "ADMIN" | "KASIR" | "SUPPLIER";

type UserRecord = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  supplier: { id: string; kode: string; nama: string } | null;
};

type SupplierOption = { id: string; kode: string; nama: string };

type UserForm = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  supplierId: string;
};

const emptyForm: UserForm = {
  username: "",
  email: "",
  password: "",
  role: "KASIR",
  isActive: true,
  supplierId: ""
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  KASIR: "Kasir",
  SUPPLIER: "Supplier"
};

const roleBadgeClass: Record<UserRole, string> = {
  ADMIN: "bg-stone-900 text-white",
  KASIR: "bg-blue-50 text-blue-700 border border-blue-200",
  SUPPLIER: "bg-amber-50 text-amber-700 border border-amber-200"
};

export function UsersManager() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"Semua" | UserRole>("Semua");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function loadSuppliers() {
    try {
      const res = await fetch("/api/suppliers", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.map((s: { id: string; kode: string; nama: string }) => ({ id: s.id, kode: s.kode, nama: s.nama })));
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    void loadUsers();
    void loadSuppliers();
  }, []);

  const filteredUsers = useMemo(() => {
    setCurrentPage(1);
    return users.filter((u) => {
      const matchSearch = `${u.username} ${u.email} ${u.supplier?.nama ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "Semua" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedUsers = filteredUsers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  let pages: (number | string)[] = [];
  if (totalPages <= 5) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (safePage <= 3) {
    pages = [1, 2, 3, 4, "...", totalPages];
  } else if (safePage >= totalPages - 2) {
    pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  } else {
    pages = [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  }

  function openCreateModal() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(user: UserRecord) {
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
      supplierId: user.supplier?.id ?? ""
    });
    setEditingId(user.id);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        username: form.username,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
        supplierId: form.role === "SUPPLIER" && form.supplierId ? form.supplierId : null
      };

      if (form.password || !editingId) {
        payload.password = form.password;
      }

      const res = await fetch(editingId ? `/api/users/${editingId}` : "/api/users", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menyimpan user");
      }

      setIsModalOpen(false);
      await loadUsers();
      if (selectedUser && editingId === selectedUser.id) setSelectedUser(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus user ini?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedUser?.id === id) setSelectedUser(null);
        await loadUsers();
      } else {
        const data = await res.json();
        alert(data.error ?? "Gagal menghapus user");
      }
    } catch { /* ignore */ }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
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
          Tambah User
        </button>
      </div>

      <div className={`grid gap-6 transition-all duration-300 ${selectedUser ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1"}`}>
        {/* Left Column: List */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm h-fit">
          <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari username, email, supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-stone-400 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-stone-500">Role</span>
              <div className="flex rounded-lg bg-stone-100 p-1">
                {(["Semua", "ADMIN", "KASIR", "SUPPLIER"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRole(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${filterRole === r ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
                  >
                    {r === "Semua" ? "Semua" : roleLabels[r]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50/50 text-xs font-semibold text-stone-500 border-b border-stone-100">
                <tr>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">MFA</th>
                  <th className="px-5 py-4">Dibuat</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center">Memuat...</td></tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center">Belum ada data user.</td></tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`cursor-pointer transition-colors ${selectedUser?.id === user.id ? "bg-stone-50" : "hover:bg-stone-50/50"}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-stone-900">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-stone-500">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${roleBadgeClass[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${user.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.mfaEnabled ? <Shield className="h-4 w-4 text-emerald-600" /> : <ShieldOff className="h-4 w-4 text-stone-300" />}
                      </td>
                      <td className="px-5 py-4 text-stone-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }} className="text-stone-400 hover:text-stone-900"><Eye className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(user); }} className="text-stone-400 hover:text-stone-900"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }} className="text-stone-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-stone-100 flex items-center justify-between text-sm text-stone-500 bg-stone-50/30">
            <span>Menampilkan {(safePage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(safePage * ITEMS_PER_PAGE, filteredUsers.length)} dari {filteredUsers.length} user</span>
            {filteredUsers.length > 0 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="px-3 py-1 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed">&lt;</button>
                {pages.map((page, i) => (
                  page === "..." ? (
                    <span key={`e-${i}`} className="px-2">...</span>
                  ) : (
                    <button key={`p-${page}`} onClick={() => setCurrentPage(page as number)} className={`px-3 py-1 rounded transition-all ${safePage === page ? "bg-stone-900 text-white font-bold shadow-sm" : "border border-stone-200 bg-white hover:bg-stone-50 text-stone-600"}`}>{page}</button>
                  )
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-3 py-1 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed">&gt;</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Details */}
        {selectedUser && (
          <div className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm h-fit sticky top-6 animate-in slide-in-from-right-8">
            <div className="p-6 border-b border-stone-100 relative">
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X className="h-5 w-5" /></button>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-stone-900 text-white flex items-center justify-center text-xl font-bold">
                  {selectedUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{selectedUser.username}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${roleBadgeClass[selectedUser.role]}`}>{roleLabels[selectedUser.role]}</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${selectedUser.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                      {selectedUser.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-stone-100">
              <h4 className="text-sm font-bold text-stone-900 mb-4">Informasi User</h4>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Username</span>
                  <span className="font-medium text-stone-900">: {selectedUser.username}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Email</span>
                  <span className="font-medium text-stone-900">: {selectedUser.email}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Role</span>
                  <span className="font-medium text-stone-900">: {roleLabels[selectedUser.role]}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Status</span>
                  <span className="font-medium text-stone-900">: {selectedUser.isActive ? "Aktif" : "Nonaktif"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">MFA</span>
                  <span className="font-medium text-stone-900">: {selectedUser.mfaEnabled ? "Aktif" : "Nonaktif"}</span>
                </div>
                {selectedUser.supplier && (
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-stone-500">Supplier</span>
                    <span className="font-medium text-stone-900">: {selectedUser.supplier.kode} - {selectedUser.supplier.nama}</span>
                  </div>
                )}
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Dibuat</span>
                  <span className="font-medium text-stone-900">: {formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-stone-500">Diupdate</span>
                  <span className="font-medium text-stone-900">: {formatDate(selectedUser.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <button
                onClick={() => openEditModal(selectedUser)}
                className="w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Edit2 className="h-4 w-4" />
                Edit User
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
              <h2 className="text-lg font-bold text-stone-900">{editingId ? "Edit User" : "Tambah User"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Username *</label>
                  <input type="text" placeholder="Masukkan username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Email *</label>
                  <input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-900">{editingId ? "Password (kosongkan jika tidak diubah)" : "Password *"}</label>
                <input type="password" placeholder="Masukkan password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} minLength={6} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Role *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole, supplierId: e.target.value !== "SUPPLIER" ? "" : form.supplierId })} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none">
                    <option value="ADMIN">Administrator</option>
                    <option value="KASIR">Kasir</option>
                    <option value="SUPPLIER">Supplier</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Status</label>
                  <select value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })} className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none">
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              {form.role === "SUPPLIER" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-900">Supplier *</label>
                  <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-900 focus:outline-none">
                    <option value="">Pilih supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.kode} - {s.nama}</option>
                    ))}
                  </select>
                </div>
              )}

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
