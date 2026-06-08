"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Barcode } from "lucide-react";

import { CartPanel, type CartItem } from "@/components/pos/CartPanel";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ProductGrid, type PosProduct } from "@/components/pos/ProductGrid";
import { TransactionHistory, type PosTransaction } from "@/components/pos/TransactionHistory";

type ProductApiResponse = {
  id: string;
  kodeBarang: string;
  nama: string;
  kategori: PosProduct["kategori"];
  satuan: string;
  hargaJual: number | string;
  stok: number | string;
  stokMinimum: number | string;
};

type TransactionApiResponse = {
  id: string;
  noTransaksi: string;
  totalAkhir: number | string;
  metodeBayar: PosTransaction["metodeBayar"];
  status: PosTransaction["status"];
  createdAt: string;
  user?: {
    username: string;
  } | null;
  details: Array<{
    id: string;
    jumlah: number | string;
    satuan: string;
  }>;
};

function normalizeProduct(product: ProductApiResponse): PosProduct {
  return {
    ...product,
    hargaJual: Number(product.hargaJual),
    stok: Number(product.stok),
    stokMinimum: Number(product.stokMinimum)
  };
}

function normalizeTransaction(transaction: TransactionApiResponse): PosTransaction {
  return {
    ...transaction,
    totalAkhir: Number(transaction.totalAkhir),
    details: transaction.details.map((detail) => ({
      ...detail,
      jumlah: Number(detail.jumlah)
    }))
  };
}

const CATEGORIES = ["SEMUA", "BESI", "SEMEN", "PASIR", "CAT", "PAKU", "ALAT", "LAIN"];

export default function PosPage() {
  const [category, setCategory] = useState("BESI");
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [transactions, setTransactions] = useState<PosTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadPosData() {
    setLoading(true);
    setError(null);

    try {
      const [productsResponse, transactionsResponse] = await Promise.all([
        fetch("/api/stock", { cache: "no-store" }),
        fetch("/api/transactions", { cache: "no-store" })
      ]);

      if (!productsResponse.ok || !transactionsResponse.ok) {
        throw new Error("LOAD_FAILED");
      }

      const [productsData, transactionsData] = (await Promise.all([
        productsResponse.json(),
        transactionsResponse.json()
      ])) as [ProductApiResponse[], TransactionApiResponse[]];

      setProducts(productsData.map(normalizeProduct));
      setTransactions(transactionsData.map(normalizeTransaction).slice(0, 8));
    } catch {
      setError("Data POS belum berhasil dimuat. Coba refresh halaman atau ulangi beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosData();
  }, []);

  const filteredProducts = useMemo(() => {
    setCurrentPage(1); // Reset page when filters change
    return products.filter((product) => {
      const matchCategory = category === "SEMUA" || product.kategori === category;
      const matchSearch =
        product.nama.toLowerCase().includes(search.toLowerCase()) ||
        product.kodeBarang.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [category, products, search]);

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const finalTotal = Math.max(total - discount, 0);

  function handleAddProduct(product: PosProduct) {
    if (product.stok <= 0) {
      return;
    }

    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        const nextJumlah = Math.min(existing.jumlah + 1, product.stok);
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                jumlah: nextJumlah,
                subtotal: nextJumlah * item.hargaSatuan
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          nama: product.nama,
          satuan: product.satuan,
          hargaSatuan: product.hargaJual,
          jumlah: 1,
          subtotal: product.hargaJual
        }
      ];
    });
  }

  function handleQuantityChange(id: string, change: number) {
    const product = products.find((item) => item.id === id);

    setCartItems((current) =>
      current
        .map((item) => {
          if (item.id !== id) {
            return item;
          }
          const nextJumlah = Math.max(item.jumlah + change, 0);
          const jumlah = change > 0 && product ? Math.min(nextJumlah, product.stok) : nextJumlah;
          return {
            ...item,
            jumlah,
            subtotal: jumlah * item.hargaSatuan
          };
        })
        .filter((item) => item.jumlah > 0)
    );
  }

  async function handleTransactionCreated() {
    await loadPosData();
  }

  async function handleTransactionCompleted() {
    setCartItems([]);
    setDiscount(0);
    await loadPosData();
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      <div className="flex-1 w-full space-y-6">
        
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-12 pr-12 text-sm text-stone-900 shadow-sm focus:border-stone-400 focus:outline-none"
          />
          <Barcode className="absolute right-4 h-5 w-5 text-stone-400 cursor-pointer" />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all shadow-sm ${
                category === cat
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="pt-2">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error}
            </div>
          )}

          {loading && !products.length && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-12 text-center text-sm text-stone-500">
              Memuat produk dari database...
            </div>
          )}

          {!loading && !filteredProducts.length && !error && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-12 text-center text-sm text-stone-500">
              Tidak ada produk yang cocok dengan pencarian atau filter saat ini.
            </div>
          )}

          {filteredProducts.length > 0 && (() => {
            const ITEMS_PER_PAGE = 8;
            const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
            // Ensure current page is within bounds
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

            return (
              <>
                <ProductGrid products={paginatedProducts} onAdd={handleAddProduct} />
                
                {/* Dynamic Pagination */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-medium transition-all ${
                          safeCurrentPage === page
                            ? "bg-stone-900 text-white font-semibold shadow-sm"
                            : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              </>
            );
          })()}
        </div>

      </div>

      <div className="w-full xl:w-[420px] shrink-0">
        <CartPanel
          items={cartItems}
          discount={discount}
          onDiscountChange={setDiscount}
          onQuantityChange={handleQuantityChange}
          onRemove={(id) => setCartItems((current) => current.filter((item) => item.id !== id))}
          onCheckout={() => setPaymentOpen(true)}
          onClear={() => {
            setCartItems([]);
            setDiscount(0);
          }}
        />
      </div>

      <PaymentModal
        open={paymentOpen}
        total={finalTotal}
        itemCount={cartItems.reduce((sum, item) => sum + item.jumlah, 0)}
        discount={discount}
        items={cartItems}
        onClose={() => setPaymentOpen(false)}
        onTransactionCreated={handleTransactionCreated}
        onTransactionCompleted={handleTransactionCompleted}
      />
    </div>
  );
}
