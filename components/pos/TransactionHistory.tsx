"use client";

import { MetodeBayar, StatusTransaksi } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export type PosTransaction = {
  id: string;
  noTransaksi: string;
  totalAkhir: number;
  metodeBayar: MetodeBayar;
  status: StatusTransaksi;
  createdAt: string;
  user?: {
    username: string;
  } | null;
  details: Array<{
    id: string;
    jumlah: number;
    satuan: string;
  }>;
};

const statusToneMap: Record<StatusTransaksi, "default" | "warning" | "success" | "danger"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELLED: "danger"
};

const methodLabelMap: Record<MetodeBayar, string> = {
  TUNAI: "Tunai",
  TRANSFER: "Transfer",
  KREDIT: "Kredit",
  QRIS: "QRIS",
  VIRTUAL_ACCOUNT: "Virtual Account"
};

export function TransactionHistory({
  transactions,
  loading
}: {
  transactions: PosTransaction[];
  loading: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>Histori Transaksi</CardTitle>
          <CardDescription className="mt-2">
            Pantau transaksi terbaru, termasuk pembayaran simulasi lokal yang masih pending atau sudah dibayar.
          </CardDescription>
        </div>
        <Badge tone="default">{transactions.length} terbaru</Badge>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
            Memuat histori transaksi...
          </div>
        ) : null}

        {!loading && !transactions.length ? (
          <div className="rounded-2xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
            Belum ada transaksi tersimpan.
          </div>
        ) : null}

        {!loading
          ? transactions.map((transaction) => {
              const totalItems = transaction.details.reduce((sum, item) => sum + item.jumlah, 0);
              return (
                <div key={transaction.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900">{transaction.noTransaksi}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {new Date(transaction.createdAt).toLocaleString("id-ID")} - Kasir {transaction.user?.username ?? "-"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="default">{methodLabelMap[transaction.metodeBayar]}</Badge>
                      <Badge tone={statusToneMap[transaction.status]}>{transaction.status}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
                    <p className="text-sm text-stone-500">{totalItems} item - {transaction.details.length} baris produk</p>
                    <p className="text-lg font-semibold text-stone-900">{formatCurrency(transaction.totalAkhir)}</p>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </Card>
  );
}
