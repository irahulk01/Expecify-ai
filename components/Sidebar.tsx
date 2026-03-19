"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  ReceiptText, 
  Target, 
  BarChart3,
  Landmark,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ArrowRightLeft, label: "Transactions", href: "/dashboard/transactions" },
  { icon: ReceiptText, label: "Bills", href: "/dashboard/bills" },
  { icon: Target, label: "Goals", href: "/dashboard/goals" },
  { icon: Landmark, label: "Debts", href: "/dashboard/debts" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
];

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border py-8 flex flex-col z-50 transition-colors">
      {/* Brand */}
      <div className="px-8 mb-12 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
          E
        </div>
        <div>
          <h1 className="text-lg font-black text-text-primary tracking-tight leading-none">Expensify AI</h1>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-0.5">Your money, smarter</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all group ${
                isActive 
                  ? "bg-surface text-primary shadow-sm border border-border" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="px-4 mt-auto space-y-4">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-500/5 transition-all group border border-transparent hover:border-rose-500/10"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Logout Session
        </button>

        <div className="p-4 bg-surface border border-border rounded-2xl shadow-sm flex items-center gap-3 group cursor-pointer hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{user?.name || "Rahul Kumar"}</p>
            <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
