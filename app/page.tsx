import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === "KASIR") {
    redirect("/pos");
  }

  if (session?.user?.role === "SUPPLIER") {
    redirect("/contracts");
  }

  redirect("/dashboard");
}
