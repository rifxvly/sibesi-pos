"use client";

import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export type CartItem = {
  id: string;
  nama: string;
  satuan: string;
  hargaSatuan: number;
  jumlah: number;
  subtotal: number;
};

export function CartPanel({
  items,
  discount,
  onQuantityChange,
  onRemove,
  onDiscountChange,
  onCheckout,
  onClear
}: {
  items: CartItem[];
  discount: number;
  onQuantityChange: (id: string, change: number) => void;
  onRemove: (id: string) => void;
  onDiscountChange: (discount: number) => void;
  onCheckout: () => void;
  onClear?: () => void;
}) {
  const [discountInput, setDiscountInput] = useState("");

  const totalItemCount = items.reduce((sum, item) => sum + item.jumlah, 0);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const finalTotal = Math.max(total - discount, 0);

  function handleApplyDiscount() {
    let d = Number(discountInput);
    if (discountInput.includes("%")) {
      const percentage = Number(discountInput.replace("%", ""));
      if (!isNaN(percentage)) {
        d = (percentage / 100) * total;
      }
    }
    if (!isNaN(d)) {
      onDiscountChange(d);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm h-[calc(100vh-140px)] sticky top-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
          <ShoppingCart className="h-5 w-5" />
          Keranjang ({totalItemCount})
        </h2>
        <button onClick={onClear} className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">
          Bersihkan
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-stone-500">
            Belum ada item di keranjang.
          </div>
        ) : null}

        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            {/* Mock Image */}
            <div className="h-12 w-12 shrink-0 rounded-lg bg-stone-100 p-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full opacity-30"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">{item.nama}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {item.id.substring(0, 6).toUpperCase()} • {formatCurrency(item.hargaSatuan)} / {item.satuan}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center rounded-lg border border-stone-200 bg-white">
                <button
                  className="flex h-7 w-7 items-center justify-center text-stone-900 hover:bg-stone-50"
                  onClick={() => onQuantityChange(item.id, -1)}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-semibold">{item.jumlah}</span>
                <button
                  className="flex h-7 w-7 items-center justify-center text-stone-900 hover:bg-stone-50"
                  onClick={() => onQuantityChange(item.id, 1)}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="text-right shrink-0 min-w-[70px]">
              <p className="text-sm font-semibold text-stone-900">{formatCurrency(item.subtotal)}</p>
            </div>
            
            <button className="text-stone-300 hover:text-rose-500 transition-colors shrink-0" onClick={() => onRemove(item.id)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-stone-100 pt-4 space-y-4">
        <div>
          <label className="text-sm font-semibold text-stone-900 mb-2 block">Diskon</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan % atau nominal"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-stone-900 focus:outline-none"
            />
            <button 
              onClick={handleApplyDiscount}
              className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Terapkan
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-medium text-stone-900">{formatCurrency(total)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-rose-500">
              <span>Diskon</span>
              <span className="font-medium">- {formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 pb-1">
            <span className="font-bold text-stone-900 uppercase tracking-widest text-xs">Total</span>
            <span className="text-2xl font-bold text-stone-900">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="grid gap-2 pt-2">
          <button 
            onClick={onCheckout} 
            disabled={!items.length}
            className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bayar Sekarang
          </button>
          <button className="w-full rounded-xl border border-stone-200 bg-white py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-50">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
