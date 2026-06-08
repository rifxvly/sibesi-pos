"use client";

import { Button } from "@/components/ui/button";

export function AuthSubmitButton({
  label,
  pending
}: {
  label: string;
  pending?: boolean;
}) {
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Memproses..." : label}
    </Button>
  );
}
