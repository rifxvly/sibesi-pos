"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categories = ["SEMUA", "BESI", "SEMEN", "PASIR", "CAT", "PAKU", "ALAT", "LAIN"];

export function CategoryFilter({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition",
            value === category
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
          )}
        >
          <span>{category}</span>
          {category === "SEMUA" ? <Badge>All</Badge> : <Badge tone="default">Filter</Badge>}
        </button>
      ))}
    </div>
  );
}
