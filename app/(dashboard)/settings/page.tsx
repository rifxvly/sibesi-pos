"use client";

import { User, Mail, Phone, Lock, Save, DownloadCloud, AlertTriangle, Store, MapPin, Eye } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { MfaSetup } from "@/components/auth/MfaSetup";

export default function SettingsPage() {
  const handleSaveStore = () => {
    alert("Pengaturan toko berhasil disimpan!");
  };
  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      <div className="grid gap-6 xl:grid-cols-2 flex-1">
        {/* Left Column */}
        <div className="space-y-6 flex flex-col">
          {/* Pengaturan Profil */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <CardTitle className="mb-6">Pengaturan Profil</CardTitle>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-stone-900 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                  AD
                </div>
                <h3 className="mt-4 font-bold text-stone-900 text-lg">Admin</h3>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full mt-1">Administrator</span>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-[20px_1fr] gap-3 items-center">
                  <User className="h-4 w-4 text-stone-400" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Nama</span>
                    <input type="text" defaultValue="Admin" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-stone-400 focus:outline-none focus:bg-white transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-3 items-center">
                  <Mail className="h-4 w-4 text-stone-400" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Email</span>
                    <input type="email" defaultValue="admin@sibesi-pos.com" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-stone-400 focus:outline-none focus:bg-white transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] gap-3 items-center">
                  <Phone className="h-4 w-4 text-stone-400" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">No HP</span>
                    <div className="flex gap-2">
                      <input type="text" defaultValue="0812-3456-7890" className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-stone-400 focus:outline-none focus:bg-white transition-colors" />
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 mt-2 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition w-full justify-center shadow-sm">
                  <Lock className="h-4 w-4" />
                  Ubah Password
                </button>
              </div>
            </div>
          </div>

          {/* Autentikasi Dua Faktor (MFA) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <CardTitle className="mb-6">Autentikasi Dua Faktor (MFA)</CardTitle>
            <MfaSetup />
          </div>

          {/* Informasi Sistem */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 relative">
            <CardTitle className="mb-6">Informasi Sistem</CardTitle>
            <div className="grid grid-cols-[140px_1fr] gap-y-4 text-sm">
              <div className="flex items-center gap-2 text-stone-500 font-semibold">
                <Store className="h-4 w-4" /> Versi Aplikasi
              </div>
              <div className="font-medium text-stone-900">SiBesi POS v1.0.0</div>

              <div className="flex items-center gap-2 text-stone-500 font-semibold">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19C3 20.6569 7.02944 22 12 22C16.9706 22 21 20.6569 21 19V5"/><path d="M3 12C3 13.6569 7.02944 15 12 15C16.9706 15 21 13.6569 21 12"/></svg>
                Database
              </div>
              <div><span className="text-xs font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 rounded-full">Connected</span></div>

              <div className="flex items-center gap-2 text-stone-500 font-semibold">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Last Backup
              </div>
              <div className="font-medium text-stone-900">31 Mei 2026 02:30 WIB</div>

              <div className="flex items-center gap-2 text-stone-500 font-semibold">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                Server
              </div>
              <div className="font-medium text-stone-900">Web Server (Linux)</div>

              <div className="flex items-center gap-2 text-stone-500 font-semibold">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Environment
              </div>
              <div className="font-medium text-stone-900">Production</div>
            </div>
            <div className="absolute right-6 bottom-6">
              <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition shadow-sm">
                <DownloadCloud className="h-4 w-4" />
                Backup Sekarang
              </button>
            </div>
          </div>

          {/* Zona Berbahaya */}
          <div className="bg-white rounded-2xl border border-rose-200 shadow-[0_2px_10px_-4px_rgba(225,29,72,0.1)] p-6">
            <h3 className="flex items-center gap-2 text-rose-600 font-bold mb-2">
              <AlertTriangle className="h-5 w-5" /> Zona Berbahaya
            </h3>
            <p className="text-xs text-stone-500 mb-6">Tindakan pada bagian ini tidak dapat dibatalkan. Pastikan Anda memahami risikonya.</p>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-rose-100">
              <div>
                <p className="font-bold text-stone-900 text-sm">Reset Demo Data (Development Only)</p>
                <p className="text-xs text-stone-500 mt-1">Hapus semua data demo dan kembalikan ke kondisi awal.</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition shadow-sm whitespace-nowrap">
                <AlertTriangle className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 flex flex-col">
          {/* Pengaturan Toko */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 relative">
            <CardTitle className="mb-6">Pengaturan Toko</CardTitle>
            <div className="space-y-5">
              <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 mt-2">
                  <Store className="h-4 w-4 text-stone-400" /> Nama Toko
                </div>
                <input type="text" defaultValue="Toko Besi Persahabatan" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-sm" />
              </div>
              
              <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 mt-2">
                  <MapPin className="h-4 w-4 text-stone-400" /> Alamat
                </div>
                <textarea rows={3} defaultValue="Jl. Persahabatan No. 2, Rawamangun&#10;Jakarta Timur, DKI Jakarta 13230" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-sm resize-none leading-relaxed"></textarea>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 mt-2">
                  <Phone className="h-4 w-4 text-stone-400" /> No Telepon
                </div>
                <input type="text" defaultValue="021-4786-1234" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-sm" />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4 items-start pb-12">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 mt-2">
                  <Mail className="h-4 w-4 text-stone-400" /> Email Toko
                </div>
                <input type="email" defaultValue="info@tokobesipersahabatan.com" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-sm" />
              </div>
            </div>
            <div className="absolute bottom-6 right-6">
              <button onClick={handleSaveStore} className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition shadow-md">
                <Save className="h-4 w-4" />
                Simpan
              </button>
            </div>
          </div>

          {/* Keamanan & Aktivitas Login */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex-1 flex flex-col">
            <CardTitle className="mb-2">Keamanan & Aktivitas Login</CardTitle>
            
            <p className="font-bold text-sm text-stone-900 mt-4 mb-4">Aktivitas Login Terbaru</p>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="text-stone-500 border-b border-stone-100">
                  <tr>
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">IP Address</th>
                    <th className="pb-3 font-semibold">Waktu</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {[
                    { u: "Admin", in: "AD", ip: "192.168.1.10", t: "31 Mei 2026 08:45:22", s: "Sukses" },
                    { u: "Kasir 1", in: "KS", ip: "192.168.1.15", t: "31 Mei 2026 08:20:11", s: "Sukses" },
                    { u: "Admin", in: "AD", ip: "192.168.1.10", t: "30 Mei 2026 17:35:44", s: "Sukses" },
                    { u: "Kasir 1", in: "KS", ip: "192.168.1.22", t: "30 Mei 2026 14:12:09", s: "Gagal" },
                    { u: "Admin", in: "AD", ip: "192.168.1.10", t: "30 Mei 2026 09:05:33", s: "Sukses" },
                  ].map((log, i) => (
                    <tr key={i} className="hover:bg-stone-50/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold">{log.in}</div>
                          <span className="font-semibold text-stone-900">{log.u}</span>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-stone-500">{log.ip}</td>
                      <td className="py-3 text-stone-500">{log.t}</td>
                      <td className="py-3 text-right">
                        <span className={`font-bold ${log.s === 'Sukses' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.s}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4 border-t border-stone-100 mt-2">
              <button className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 px-4 py-2 border border-stone-200 rounded-lg transition hover:bg-stone-50">
                <Eye className="h-3 w-3" />
                Lihat Semua Aktivitas
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 text-center text-xs font-medium text-stone-400 pb-4">
        &copy; 2026 SiBesi POS. All rights reserved.
      </footer>
    </div>
  );
}
