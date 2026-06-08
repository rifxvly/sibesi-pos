import { auth } from "@/auth";
import { ContractsManager } from "@/components/contracts/ContractsManager";

export default async function ContractsPage() {
  const session = await auth();

  return <ContractsManager role={session?.user?.role ?? "ADMIN"} />;
}
