import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200",
        className
      )}
      {...props}
    />
  );
}
