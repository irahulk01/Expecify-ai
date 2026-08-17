import Sidebar from "@/components/layout/Sidebar";
import AIAssistant from "@/components/ai/AIAssistant/AIAssistant";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary selection:text-white transition-colors flex">
      {/* Sidebar - Pass session user */}
      <Sidebar user={session.user} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-w-0 transition-all pt-16 md:pt-0">{children}</div>

      <AIAssistant />
    </div>
  );
}
