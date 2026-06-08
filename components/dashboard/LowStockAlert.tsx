import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function LowStockAlert({
  items
}: {
  items: {
    id: string;
    kodeBarang: string;
    nama: string;
    stok: number;
    stokMinimum: number;
  }[];
}) {
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-800">Peringatan Stok Rendah</CardTitle>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-amber-200/60 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-stone-900">{item.nama}</p>
                <p className="text-sm text-stone-500">{item.kodeBarang}</p>
              </div>
              <Badge tone="warning">
                {item.stok} / min {item.stokMinimum}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
