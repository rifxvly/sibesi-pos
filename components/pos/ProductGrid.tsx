"use client";

import { Minus, Plus, Hammer, Box, Cylinder, PaintBucket, Wrench, Hexagon, Component, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const getCategoryIcon = (kategori: string) => {
  const cat = kategori?.toUpperCase() || "";
  if (cat.includes('BESI')) return <Cylinder className="h-12 w-12 text-stone-400 transition-transform group-hover:scale-110" />;
  if (cat.includes('SEMEN')) return <Box className="h-12 w-12 text-stone-400 transition-transform group-hover:scale-110" />;
  if (cat.includes('PASIR')) return <Hexagon className="h-12 w-12 text-stone-400 transition-transform group-hover:scale-110" />;
  if (cat.includes('CAT')) return <PaintBucket className="h-12 w-12 text-stone-400 transition-transform group-hover:scale-110" />;
  if (cat.includes('PAKU')) return <Component className="h-12 w-12 text-stone-400 transition-transform group-hover:scale-110" />;
  if (cat.includes('ALAT')) return <Wrench className="h-12 w-12 text-stone-400 transition-transform group-hover:scale-110" />;
  return <ImageIcon className="h-12 w-12 text-stone-400 transition-transform group-hover:scale-110" />;
};

export type PosProduct = {
  id: string;
  kodeBarang: string;
  nama: string;
  kategori: string;
  satuan: string;
  hargaJual: number;
  stok: number;
  stokMinimum: number;
  populer?: boolean;
};

export function ProductGrid({
  products,
  onAdd
}: {
  products: PosProduct[];
  onAdd: (product: PosProduct) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const isLowStock = product.stok < product.stokMinimum;
        const isOutOfStock = product.stok <= 0;
        
        return (
          <div 
            key={product.id} 
            onClick={() => !isOutOfStock && onAdd(product)}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition-all hover:shadow-md ${isOutOfStock ? 'opacity-50 border-stone-200' : 'border-stone-200 hover:border-stone-300'}`}
          >
            {/* Dynamic Category Icon Placeholder */}
            <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-xl bg-stone-50 p-2 border border-stone-100 group-hover:bg-stone-100 transition-colors">
              {getCategoryIcon(product.kategori)}
            </div>
            
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">{product.nama}</h3>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-500">{product.kodeBarang}</p>
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-bold text-stone-900">{formatCurrency(product.hargaJual)}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                  <span className={`font-medium ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
                    Stok: {product.stok} {product.satuan}
                  </span>
                  {isLowStock && !isOutOfStock && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      Sisa {product.stok}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
