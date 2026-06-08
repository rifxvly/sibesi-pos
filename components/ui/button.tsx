import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-stone-900 text-white hover:bg-stone-800": variant === "primary",
          "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50": variant === "secondary",
          "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900": variant === "ghost",
          "bg-rose-600 text-white hover:bg-rose-500": variant === "danger"
        },
        className
      )}
      type={type}
      {...props}
    />
  );
}
