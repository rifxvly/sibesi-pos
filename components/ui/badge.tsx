import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  children
}: {
  className?: string;
  tone?: "default" | "warning" | "success" | "danger";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-stone-100 text-stone-700": tone === "default",
          "bg-amber-100 text-amber-800": tone === "warning",
          "bg-emerald-100 text-emerald-700": tone === "success",
          "bg-rose-100 text-rose-700": tone === "danger"
        },
        className
      )}
    >
      {children}
    </span>
  );
}
