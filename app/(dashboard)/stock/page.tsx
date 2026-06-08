import { auth } from "@/auth";
import { StockManager } from "@/components/stock/StockManager";

export default async function StockPage() {
  const session = await auth();

  return <StockManager role={session?.user?.role ?? "ADMIN"} />;
}
