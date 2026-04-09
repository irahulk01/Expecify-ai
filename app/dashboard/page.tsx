"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Bell, ShoppingBag, 
  Mic, 
  Zap, Target, Wallet,
  Plane
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import ThemeToggle from "@/components/ThemeToggle";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: string;
  category: string;
}

interface DashboardData {
  metrics: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    monthlySavings: number;
    totalDebt: number;
    categories: any[];
    charts: { daily: any[]; monthly: any[] };
  };
  transactions: Transaction[];
  bills: any[];
  goals: any[];
  accounts: any[];
  debts: any[];
}

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const r = await fetch(`/api/dashboard?range=30`);
      if (r.status === 401) {
        window.location.href = "/onboarding";
        return Promise.reject("Unauthorized");
      }
      return r.json();
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };
    window.addEventListener("dashboard-update", handleUpdate);
    return () => window.removeEventListener("dashboard-update", handleUpdate);
  }, [queryClient]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center font-bold">
        Initializing dashboard...
      </div>
    );
  }

  const { 
    metrics = { totalBalance: 0, totalIncome: 0, totalExpenses: 0, monthlySavings: 0, totalDebt: 0, categories: [], charts: { daily: [], monthly: [] } }, 
    transactions = [] as Transaction[],
    bills = [],
    goals = [],
    accounts = [],
    debts = []
  } = (data || {});

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="min-w-0 transition-all">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50">
        <div className="w-full md:flex-1 md:max-w-2xl relative group flex items-center gap-3">
          <div className="relative flex-1">
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder='Voice Command Listening for intent...' 
              className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none shadow-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  window.dispatchEvent(new CustomEvent("open-ai", { detail: { prompt: (e.currentTarget as HTMLInputElement).value } }));
                  (e.currentTarget as HTMLInputElement).value = '';
                }
              }}
            />
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-ai", { detail: { prompt: "__MIC__" } }))}
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
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai", { detail: { prompt: "Help me log a new expense: " } }))}
            className="px-6 py-3 bg-primary text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 space-y-10 animate-fade-in-up">
        {/* Metric Cards Top Row */}
        <section className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-4 gap-4 md:grid md:grid-cols-6 md:mx-0 md:px-0 md:pb-0 md:gap-6">
          {[
            { label: "Total Balance", value: metrics?.totalBalance, sub: "Primary Balance" },
            { label: "Monthly Income", value: metrics?.totalIncome, sub: "Direct Deposits" },
            { label: "Total Spent", value: metrics?.totalExpenses, sub: `30 Day Period` },
            { label: "Total Debt", value: metrics?.totalDebt, sub: `${debts.length} Active Loans`, color: "text-red-500" },
            { label: "Savings Goals", value: metrics?.monthlySavings, sub: `${goals.length} Active Targets` },
            { label: "Upcoming Bills", value: bills.filter((b: any) => b.status === "unpaid").length, isCount: true, sub: "Due this week" }
          ].map((metric, i) => (
            <div key={i} className="bg-surface border border-border p-6 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative shrink-0 w-[80%] md:w-auto snap-center">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai", { detail: { prompt: `Help me manage my ${metric.label}: ` } }))}
                className="absolute top-4 right-4 p-2 rounded-lg bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
              >
                <Plus className="w-3 h-3" />
              </button>
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-[0.2em] mb-4 group-hover:text-primary transition-colors">{metric.label}</p>
              <p className={`text-2xl font-black tracking-tighter mb-1 ${metric.color || 'text-text-primary'}`}>
                {metric.isCount ? metric.value : `₹${metric.value?.toLocaleString("en-IN")}`}
              </p>
              <p className="text-[10px] font-bold text-text-secondary opacity-70 truncate">{metric.sub}</p>
            </div>
          ))}
        </section>

        {/* Main Grid: Graph + Activity | Sidebar Widgets */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            {/* Spending Trend Graph */}
            <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 px-2">
                   <div>
                      <h3 className="font-black text-xl text-text-primary tracking-tight">Spending Trend</h3>
                      <p className="text-xs font-bold text-text-secondary mt-1">Velocity breakdown over past 7 days</p>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-[10px] font-black text-primary uppercase tracking-widest">
                         <div className="w-2 h-2 rounded-full bg-primary" /> Expense
                      </div>
                   </div>
                </div>
                
                <div className="h-[300px] w-full pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.charts.daily}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        hide 
                        domain={[0, 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111827', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#2DD4BF' }}
                        cursor={{ stroke: '#2DD4BF', strokeWidth: 2, strokeDasharray: '5 5' }}
                        formatter={(val: any) => `₹${Number(val).toLocaleString()}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#2DD4BF" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Today's Timeline */}
            <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xl text-text-primary tracking-tight">Recent Activity</h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent("open-ai", { detail: { prompt: "Analyze my recent spending activity and suggest edits" } }))}
                    className="p-2 rounded-lg bg-background border border-border text-text-secondary hover:text-primary transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => window.location.href = "/dashboard/transactions"}
                    className="text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                  >
                    View Ledger
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-border/50">
                {recentTx.length === 0 && <p className="text-sm text-text-secondary text-center py-10 font-bold">No activity logged yet.</p>}
                {recentTx.map((tx: Transaction) => (
                  <div key={tx.id} className="flex items-center gap-6 py-5 group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/5 text-primary group-hover:bg-primary/20'
                    }`}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base text-text-primary">{tx.title}</p>
                      <p className="text-xs font-medium text-text-secondary opacity-70 mt-0.5">
                        {new Date(tx.date).toLocaleDateString()} • {tx.category}
                      </p>
                    </div>
                    <p className={`font-black text-base ${tx.type === 'income' ? 'text-emerald-500' : 'text-text-primary'}`}>
                      {tx.type === 'income' ? '+' : ''}₹{tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Widget Column - Slider on Mobile */}
          <div className="lg:col-span-4 flex lg:flex-col overflow-x-auto lg:overflow-visible hide-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-6 gap-6 lg:mx-0 lg:px-0 lg:pb-0">
            {/* Payment Hub */}
             <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm shrink-0 w-[85%] lg:w-full snap-center">
               <h4 className="font-black text-lg text-text-primary mb-8 tracking-tight">Payment Hub</h4>
               <div className="grid grid-cols-2 gap-4">
                  {accounts.map((wallet: any, i: number) => (
                    <div key={i} className="p-4 bg-background rounded-2xl group hover:border-primary/20 border border-transparent transition-all">
                      <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest mb-1">{wallet.name}</p>
                      <p className="text-sm font-black text-text-primary tabular-nums">₹{wallet.balance.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="bg-background border border-dashed border-border rounded-2xl flex items-center justify-center text-text-secondary hover:text-primary cursor-pointer hover:border-primary/50 transition-all min-h-[60px]">
                    <Plus className="w-5 h-5" />
                  </div>
               </div>
            </div>

            {/* Upcoming Widget */}
            <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm relative transition-colors shrink-0 w-[85%] lg:w-full snap-center">
               <div className="absolute -top-3 right-8 w-10 h-10 rounded-2xl bg-[#044E45] flex items-center justify-center text-white shadow-lg">
                 <Zap className="w-5 h-5" />
               </div>
               <h4 className="font-black text-lg text-text-primary mb-6 tracking-tight">Upcoming</h4>
               <div className="space-y-4">
                  {bills.filter((b: any) => b.status === "unpaid").slice(0, 3).map((bill: any, i: number) => (
                    <div key={i} className="p-4 bg-background rounded-2xl flex items-center gap-4 group hover:bg-surface border border-transparent hover:border-border transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{bill.title}</p>
                        <p className="text-[10px] font-medium text-text-secondary mt-0.5 whitespace-nowrap">Due {new Date(bill.dueDate).toLocaleDateString()} • <span className="text-error font-bold">₹{bill.amount.toLocaleString()}</span></p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Savings Goals */}
            <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm shrink-0 w-[85%] lg:w-full snap-center">
                <h4 className="font-black text-lg text-text-primary mb-8 tracking-tight">Savings Goals</h4>
                <div className="space-y-4">
                  {goals.length === 0 && <p className="text-xs text-text-secondary font-bold text-center py-4">No goals set.</p>}
                  {goals.slice(0, 2).map((goal: any, i: number) => (
                    <div key={i} className="p-6 bg-background rounded-[2rem] border border-border relative overflow-hidden group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                          <Plane className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-text-primary tracking-tight">{goal.title}</h5>
                          <p className="text-xs font-medium text-text-secondary opacity-70">₹{goal.currentAmount.toLocaleString()} of ₹{goal.targetAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-surface rounded-full overflow-hidden mb-4 border border-border">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            {/* Debts Widget */}
            <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm shrink-0 w-[85%] lg:w-full snap-center">
                <h4 className="font-black text-lg text-text-primary mb-8 tracking-tight">Active Debts</h4>
                <div className="space-y-4">
                  {debts.length === 0 && <p className="text-xs text-text-secondary font-bold text-center py-4">No active debts.</p>}
                  {debts.slice(0, 3).map((debt: any, i: number) => (
                    <div key={i} className="p-4 bg-background rounded-2xl flex flex-col gap-3 group hover:border-red-400/30 border border-transparent transition-all">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest">{debt.title}</p>
                        <p className="text-xs font-black text-red-500">₹{debt.remainingAmount.toLocaleString()}</p>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100}%` }} 
                        />
                      </div>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent("open-ai", { detail: { prompt: `I want to pay ₹ for my ${debt.title} debt` } }))}
                        className="text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-primary text-left"
                      >
                        Record Payment
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </section>

        {/* Bottom Grid: Categories */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Categories */}
          <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm">
             <h4 className="font-black text-lg text-text-primary mb-8 tracking-tight">Top Categories</h4>
             <div className="space-y-6">
               {metrics.categories.map((cat: any, i: number) => (
                 <div key={i}>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-text-primary">{cat.label}</span>
                     <span className="text-xs font-black text-text-primary">₹{cat.amount.toLocaleString()}</span>
                   </div>
                   <div className="h-2 bg-background rounded-full overflow-hidden">
                     <div className="h-full bg-[#044E45] rounded-full" style={{ width: cat.value + "%" }} />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-[#044E45] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl flex flex-col justify-center">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Target className="w-48 h-48" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-6">
                 <Zap className="w-4 h-4 text-emerald-400" />
                 <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">AI Insight</span>
               </div>
               <p className="text-2xl font-bold leading-snug mb-8 max-w-md">
                 Rahul, your spending on <span className="text-emerald-400 italic">Food & Drinks</span> is 14% lower than last month. Keep it up!
               </p>
               <button className="px-8 py-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl font-black text-xs uppercase tracking-widest text-emerald-100 transition-all">
                 Review Financial Health
               </button>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
