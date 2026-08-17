"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Bell,
  Search,
  Home,
  Zap,
  Tv,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Clock,
  Phone,
  Mic,
  Loader2,
} from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadBills = () => {
    setLoading(true);
    fetch(`/api/dashboard`)
      .then((r) => r.json())
      .then((d) => {
        setBills(d.bills || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handlePayBill = async (id: string) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/bills/${id}/pay`, { method: "POST" });
      if (res.ok) {
        loadBills();
      }
    } finally {
      setPayingId(null);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Home":
        return Home;
      case "Zap":
        return Zap;
      case "Tv":
        return Tv;
      case "Phone":
        return Phone;
      default:
        return CreditCard;
    }
  };

  const filteredBills = bills.filter(
    (b) =>
      activeTab === "all" ||
      (activeTab === "upcoming" && b.status === "unpaid") ||
      (activeTab === "paid" && b.status === "paid")
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold text-text-secondary">
        Fetching obligations...
      </div>
    );
  }

  return (
    <div className="min-w-0 transition-all">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50">
        <div className="w-full md:flex-1 md:max-w-2xl relative group flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Find a biller..."
              className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none shadow-sm"
            />
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-ai", { detail: { prompt: "__MIC__" } }))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-secondary hover:text-primary transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:shadow-md">
              <Bell className="w-5 h-5" />
            </button>
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Add Biller
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 space-y-10 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">
              Obligations & Bills
            </h1>
            <p className="text-sm text-text-secondary font-medium">
              Auto-tracked from your messages and linked accounts.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 font-mono">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                Paid Total:{" "}
              </span>
              <span className="text-sm font-black text-emerald-500 ml-2">
                ₹
                {bills
                  .filter((b) => b.status === "paid")
                  .reduce((sum, b) => sum + b.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
              {["upcoming", "paid", "all"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === t
                      ? "bg-primary text-white shadow-md"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-6 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:pb-0">
          {filteredBills.map((bill) => {
            const Icon = getIcon(bill.icon);
            return (
              <div
                key={bill.id}
                className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden shrink-0 w-[85%] md:w-auto snap-center"
              >
                <div className="flex items-start justify-between mb-8">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-1">
                      Due Date
                    </p>
                    <p className="text-sm font-black text-text-primary">
                      {new Date(bill.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-black text-text-primary mb-1 tracking-tight">
                    {bill.title}
                  </h4>
                  <p className="text-2xl font-black text-primary tracking-tighter">
                    ₹{bill.amount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    disabled={bill.status === "paid" || payingId === bill.id}
                    onClick={() => handlePayBill(bill.id)}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      bill.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-500 cursor-default shadow-sm"
                        : "bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
                    }`}
                  >
                    {payingId === bill.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        Processing...
                      </>
                    ) : bill.status === "paid" ? (
                      "Paid"
                    ) : (
                      "Mark as Paid"
                    )}
                  </button>
                  <button className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {bill.status === "unpaid" && (
                  <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase">
                    <AlertCircle className="w-3 h-3" />
                    Biller Verified • Payment Pending
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-2 border-dashed border-border rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-all bg-linear-to-b from-surface to-background/50 shrink-0 w-[85%] md:w-auto snap-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-text-primary mb-1">Link New Bill</p>
            <p className="text-[10px] font-bold text-text-secondary px-6">
              Connect your utility accounts for auto-imports.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
