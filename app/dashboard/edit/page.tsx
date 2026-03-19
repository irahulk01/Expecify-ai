"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Trash2, Pencil, Check, X, PieChart, 
  Wallet, Target, Activity, Search, Filter,
  ChevronLeft, ChevronRight, TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TAILWIND_COLORS: Record<string, string> = {
  "bg-orange-400": "#fb923c",
  "bg-cyan-400": "#22d3ee",
  "bg-yellow-400": "#facc15",
  "bg-red-400": "#f87171",
  "bg-indigo-400": "#818cf8",
  "bg-emerald-400": "#34d399",
};

interface FinancialItem {
  id: string;
  title: string;
  amount: number;
  category?: string;
  type?: "income" | "expense";
  date?: string;
  totalAmount?: number;
  remainingAmount?: number;
}

interface Category {
  label: string;
  amount: number;
  color: string;
}

export default function EditDataPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", amount: "" });
  const [activeTab, setActiveTab] = useState<"transactions" | "incomes" | "investments" | "debts">("transactions");
  const [filterText, setFilterText] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const startEdit = (item: FinancialItem) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, amount: item.amount.toString() });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (type: string, id: string) => {
    await fetch("/api/dashboard/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, title: editForm.title, amount: Number(editForm.amount) }),
    });
    setEditingId(null);
    fetchData();
  };

  const fetchData = () => {
    // using range=all to get complete category breakdown and all transactions
    fetch("/api/dashboard?range=30")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type: string, id: string) => {
    await fetch("/api/dashboard/edit", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    fetchData();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Activity className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium tracking-widest text-sm uppercase">Loading Data...</p>
      </div>
    </div>
  );

  const { metrics, user, transactions = [] } = data;
  const categories = metrics?.categories || [];
  
  // Calculate totals
  const totalExpenses = (transactions || [])
    .filter((tx: FinancialItem) => tx.type === "expense")
    .reduce((sum: number, tx: FinancialItem) => sum + tx.amount, 0);

  // SVG Donut Logic
  const donutSegments = categories.reduce((acc: (Category & { isFull: boolean; hexColor: string; pathData?: string; endAngle: number })[], cat: Category) => {
    const percent = (cat.amount / (totalExpenses || 1));
    const startAngle = (acc.length > 0 ? acc[acc.length - 1].endAngle : 0);
    const endAngle = startAngle + (percent * 360);
    
    // Calculate path for donut
    const x1 = Math.cos((startAngle - 90) * (Math.PI / 180)) * 40 + 50;
    const y1 = Math.sin((startAngle - 90) * (Math.PI / 180)) * 40 + 50;
    const x2 = Math.cos((endAngle - 90) * (Math.PI / 180)) * 40 + 50;
    const y2 = Math.sin((endAngle - 90) * (Math.PI / 180)) * 40 + 50;
    
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    if (percent >= 0.999) {
      acc.push({
        ...cat,
        isFull: true,
        hexColor: TAILWIND_COLORS[cat.color] || "#a855f7",
        endAngle
      });
      return acc;
    }

    const pathData = [
      `M ${x1} ${y1}`, 
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`
    ].join(" ");
    
    acc.push({
      ...cat,
      isFull: false,
      pathData,
      hexColor: TAILWIND_COLORS[cat.color] || "#a855f7",
      endAngle
    });

    return acc;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PaginatedItem = ({ item }: { item: FinancialItem }) => (
    <div key={item.id} className="group flex justify-between items-center p-4 bg-[#0A0A0B] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      {editingId === item.id ? (
        <div className="flex items-center gap-3 w-full flex-wrap sm:flex-nowrap">
          <input 
            type="text" 
            value={editForm.title} 
            onChange={(e) => setEditForm(f => ({...f, title: e.target.value}))} 
            className="bg-white/5 text-sm font-bold px-4 py-2.5 rounded-xl border border-white/10 focus:border-primary focus:outline-none flex-1 min-w-0" 
            placeholder="Title"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 font-bold ml-1 sm:ml-0">₹</span>
            <input 
              type="number" 
              value={editForm.amount} 
              onChange={(e) => setEditForm(f => ({...f, amount: e.target.value}))} 
              className="bg-white/5 text-sm font-bold px-3 py-2.5 rounded-xl border border-white/10 focus:border-primary focus:outline-none w-28 shrink-0 tabular-nums" 
              placeholder="Amount"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            <button onClick={() => handleSave(activeTab.slice(0,-1), item.id)} className="bg-emerald-500/20 text-emerald-400 p-2.5 hover:bg-emerald-500/30 rounded-xl transition-colors shadow-sm"><Check className="w-4 h-4" /></button>
            <button onClick={cancelEdit} className="bg-white/5 text-slate-400 p-2.5 hover:bg-white/10 rounded-xl transition-colors shadow-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <>
          <div className="min-w-0 pr-4">
            <p className="font-bold text-sm text-white truncate mb-1">{item.title}</p>
            {item.category && (
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 truncate">{item.category}</p>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className={`tabular-nums block font-black ${activeTab === "transactions" ? (item.type === "income" ? "text-emerald-400" : "text-slate-300") : "text-white"}`}>
                {item.type === "income" && activeTab === "transactions" ? "+" : ""}
                ₹{(item.remainingAmount !== undefined ? item.remainingAmount : item.amount).toLocaleString("en-IN")}
              </span>
              {activeTab === "debts" && item.totalAmount && (
                <span className="text-[10px] font-bold text-slate-500 block">
                  of ₹{item.totalAmount.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(item)} className="bg-white/5 text-primary hover:bg-primary/20 p-2 rounded-xl transition-colors tooltip-target">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(activeTab.slice(0,-1), item.id)} className="bg-white/5 text-red-400 hover:bg-red-500/20 p-2 rounded-xl transition-colors tooltip-target">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const allItems: Record<string, FinancialItem[]> = {
    transactions: transactions || [],
    incomes: user?.incomes || [],
    investments: user?.investments || [],
    debts: user?.debts || [],
  };

  const CATEGORIES = ["Food", "Transport", "Entertainment", "Utilities", "Shopping", "Health", "Education", "Travel", "Salary", "Household", "Debt", "Investment", "Other"];

  const filteredItems = allItems[activeTab].filter((item: FinancialItem) => {
    const matchesText = item.title.toLowerCase().includes(filterText.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesText && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const TABS = [
    { id: "transactions", label: "Transactions", count: allItems.transactions.length, icon: Activity },
    { id: "incomes", label: "Incomes", count: allItems.incomes.length, icon: Wallet },
    { id: "investments", label: "Investments", count: allItems.investments.length, icon: Target },
    { id: "debts", label: "Debts", count: allItems.debts.length, icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white pb-12 selection:bg-primary/30">
      
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-2xl border-b border-white/5 pt-6 pb-4 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <div>
              <p className="text-[10px] text-primary font-bold tracking-widest uppercase mb-0.5">Control Center</p>
              <h1 className="text-xl font-black tracking-tight">Financial Data</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── Left Sidebar: Pie Chart & Categories ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/2 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            
            <h2 className="text-lg font-bold flex items-center gap-2 self-start w-full mb-8 tracking-tight">
              <PieChart className="w-5 h-5 text-purple-400" />
              Expense Distribution
            </h2>

            {categories.length > 0 ? (
              <div className="relative w-48 h-48 mb-8 drop-shadow-2xl">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 scale-110">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  {donutSegments.map((seg: { label: string; amount: number; isFull: boolean; hexColor: string; pathData?: string }, i: number) => (
                    seg.isFull ? (
                       <circle key={i} cx="50" cy="50" r="40" fill="transparent" stroke={seg.hexColor} strokeWidth="12" />
                    ) : (
                      <motion.path
                        key={i}
                        d={seg.pathData}
                        fill="transparent"
                        stroke={seg.hexColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
                        className="drop-shadow-lg"
                      />
                    )
                  ))}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Spent</p>
                  <p className="text-xl font-black tracking-tighter mt-0.5">₹{metrics.totalExpenses.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 border-12 border-white/5 rounded-full flex items-center justify-center mb-8">
                <p className="text-sm font-medium text-slate-500 text-center px-4">No Data</p>
              </div>
            )}

            <div className="w-full space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {categories.map((cat: any) => {
                const hexColor = TAILWIND_COLORS[cat.color] || "#a855f7";
                return (
                  <div key={cat.label} className="flex justify-between items-center p-3 bg-[#0A0A0B] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: hexColor, boxShadow: `0 0 10px ${hexColor}80` }} />
                      <p className="text-sm font-bold text-slate-300">{cat.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black tabular-nums">₹{cat.amount.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] font-bold text-slate-500">{Math.round((cat.amount / totalExpenses) * 100)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Content: Data Management Tabs ── */}
        <div className="lg:col-span-8 flex flex-col">
          
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-6 overflow-x-auto custom-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-white/2"
                  }`}
                >
                  <Icon className="w-4 h-4" /> 
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 bg-white/2 border border-white/10 rounded-[2.5rem] p-6 lg:p-8 flex flex-col">
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={filterText}
                  onChange={(e) => {
                    setFilterText(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
              {activeTab === "transactions" && (
                <div className="min-w-[160px] relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select 
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#0A0A0B] border border-white/5 rounded-2xl py-3 pl-11 pr-8 text-sm focus:border-primary focus:outline-none transition-all appearance-none text-slate-300 font-medium"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeTab + filterText + filterCategory + currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 flex-1"
              >
                {paginatedItems.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center opacity-50">
                    <PieChart className="w-12 h-12 text-slate-400 mb-4" />
                    <p className="text-lg font-bold text-slate-300">No {activeTab} Data.</p>
                  </div>
                ) : paginatedItems.map((item: FinancialItem) => (
                    <PaginatedItem key={item.id} item={item} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Page</span>
                  <span className="text-sm font-black text-white">{currentPage}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">of {totalPages}</span>
                  <span className="ml-2 text-[10px] text-slate-600 font-medium tracking-tight">({filteredItems.length} total)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl bg-[#0A0A0B] border border-white/5 flex items-center justify-center hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl bg-[#0A0A0B] border border-white/5 flex items-center justify-center hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
