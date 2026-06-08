import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function ContractPreview({
  contract
}: {
  contract: {
    noKontrak: string;
    customerName: string;
    customerAddress: string;
    jadwalKirim?: string;
    totalNilai: number;
    dp?: number;
    tempoPembayaran?: number;
    items: {
      nama: string;
      jumlah: number;
      satuan: string;
      hargaSatuan: number;
      subtotal: number;
    }[];
  };
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Preview Kontrak</CardTitle>
          <CardDescription className="mt-2">Format ini selaras dengan generator PDF kontrak digital.</CardDescription>
        </div>
        <Badge tone="warning">Review</Badge>
      </div>

      <div className="mt-6 space-y-3 text-sm text-slate-300">
        <p>No. Kontrak: {contract.noKontrak}</p>
        <p>Pelanggan: {contract.customerName}</p>
        <p>Alamat: {contract.customerAddress}</p>
        <p>Jadwal Kirim: {contract.jadwalKirim ?? "-"}</p>
        <p>Tempo Pembayaran: {contract.tempoPembayaran ?? 0} hari</p>
      </div>

      <div className="mt-6 space-y-3">
        {contract.items.map((item) => (
          <div key={`${item.nama}-${item.satuan}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{item.nama}</p>
                <p className="text-sm text-slate-400">
                  {item.jumlah} {item.satuan} x {formatCurrency(item.hargaSatuan)}
                </p>
              </div>
              <p className="font-semibold text-white">{formatCurrency(item.subtotal)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between text-slate-300">
          <span>Total Nilai</span>
          <span className="font-semibold text-amber-300">{formatCurrency(contract.totalNilai)}</span>
        </div>
      </div>
    </Card>
  );
}
