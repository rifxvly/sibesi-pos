import { ArrowUpRight, ArrowDownRight, Package, Users, Receipt, CircleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function StatsCard({
  label,
  value,
  helper,
  tone = "default"
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "warning" | "success" | "danger";
}) {
  let Icon = Receipt;
  let bgClass = "bg-stone-100 text-stone-600";
  
  if (tone === "success") {
    Icon = Receipt;
    bgClass = "bg-emerald-100 text-emerald-600";
  } else if (tone === "warning") {
    Icon = CircleAlert;
    bgClass = "bg-amber-100 text-amber-600";
  } else if (tone === "danger") {
    Icon = CircleAlert;
    bgClass = "bg-rose-100 text-rose-600";
  }

  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
          {tone === "success" || tone === "default" ? (
            <span className="flex items-center font-medium text-emerald-600">
              <ArrowUpRight className="mr-0.5 h-3 w-3" />
              12.4%
            </span>
          ) : tone === "danger" || tone === "warning" ? (
            <span className="font-medium text-amber-600">
              Perlu perhatian
            </span>
          ) : null}
          {tone === "success" || tone === "default" ? "dari kemarin" : ""}
        </div>
      </div>
    </Card>
  );
}
