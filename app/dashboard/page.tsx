import { getDashboardData } from "@/actions/dashboard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const initialData = await getDashboardData("30");

  return <DashboardClient initialData={initialData as any} />;
}
