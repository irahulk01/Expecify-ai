"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Bell,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Mic,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: string;
  category: string;
}

const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`/api/dashboard?range=30`)
      .then((r) => r.json())
      .then((data) => {
        setTransactions(data.transactions || []);
        setLoading(false);
      });
  }, []);

  const filteredTx = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTx.length / ITEMS_PER_PAGE);
  const paginatedTx = filteredTx.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (t: string) => {
    setFilter(t);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold text-text-secondary">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="min-w-0 transition-all">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50">
        <div className="w-full md:flex-1 md:max-w-2xl relative group flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search transactions..."
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
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Ledger & History</h1>
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
            {["all", "income", "expense"].map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === t
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Graph Section */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl text-text-primary tracking-tight">
                Spending Visualization
              </h3>
              <p className="text-xs font-bold text-text-secondary mt-1">
                Summary of outflows across the current period
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black uppercase text-rose-500">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  const dateStr = d.toLocaleDateString();
                  const amount = transactions
                    .filter(
                      (tx) =>
                        tx.type === "expense" && new Date(tx.date).toLocaleDateString() === dateStr
                    )
                    .reduce((sum, tx) => sum + tx.amount, 0);
                  return { name: d.toLocaleDateString("en-IN", { weekday: "short" }), amount };
                })}
              >
                <defs>
                  <linearGradient id="colorAmountTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "none",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  formatter={(val: any) => `₹${Number(val).toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#F43F5E"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmountTx)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Table/List */}
        <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
          <div className="grid grid-cols-12 px-8 py-5 border-b border-border bg-background/50 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
            <div className="col-span-6">Transaction Details</div>
            <div className="col-span-2 text-center">Category</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="divide-y divide-border/50 flex-1">
            {paginatedTx.length === 0 && (
              <div className="py-20 text-center text-text-secondary font-bold">
                No transactions found.
              </div>
            )}
            {paginatedTx.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-12 px-8 py-6 items-center group hover:bg-background/40 transition-colors"
              >
                <div className="col-span-6 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === "income"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{tx.title}</p>
                    <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wide opacity-60">
                      Success • {tx.type === "income" ? "Wallet Credit" : "Merchant Debit"}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-3 py-1 rounded-full bg-background border border-border text-[10px] font-bold text-text-secondary uppercase">
                    {tx.category}
                  </span>
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-2 text-xs font-bold text-text-secondary">
                  <Calendar className="w-3 h-3" />
                  {new Date(tx.date).toLocaleDateString()}
                </div>
                <div className="col-span-2 text-right">
                  <p
                    className={`font-black text-lg ${
                      tx.type === "income" ? "text-emerald-500" : "text-text-primary"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"} ₹{tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-8 py-6 border-t border-border bg-background/30 flex items-center justify-between">
              <p className="text-xs font-bold text-text-secondary">
                Showing {Math.min(filteredTx.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} to{" "}
                {Math.min(filteredTx.length, currentPage * ITEMS_PER_PAGE)} of {filteredTx.length}{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-text-secondary disabled:opacity-30 enabled:hover:bg-surface transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)]
                    .map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                          currentPage === i + 1
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-text-secondary hover:bg-surface"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))
                    .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-text-secondary disabled:opacity-30 enabled:hover:bg-surface transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
