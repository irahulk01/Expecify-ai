"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Bell, Search, BarChart3, TrendingUp, TrendingDown, Calendar, Download, Share2, Mic
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import ThemeToggle from "@/components/ThemeToggle";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("Monthly");

  useEffect(() => {
    fetch(`/api/dashboard?range=30`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold text-text-secondary">
        Analyzing intelligence...
      </div>
    );
  }

  const { metrics = {} } = data;

  return (
    <div className="min-w-0 transition-all">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50">
        <div className="w-full md:flex-1 md:max-w-2xl relative group flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder='Search insights...' 
              className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none shadow-sm"
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
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 space-y-10 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">Financial Intelligence</h1>
            <p className="text-sm text-text-secondary font-medium">Holistic analysis of your wealth and cash flow.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
            {["Weekly", "Monthly"].map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  range === t ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence Cards */}
        <section className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-4 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:mx-0 md:px-0 md:pb-0">
           <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm shrink-0 w-[80%] md:w-auto snap-center">
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-4">Savings Rate</p>
              <div className="flex items-end gap-2 mb-2">
                 <p className="text-3xl font-black text-text-primary tracking-tighter">18.4%</p>
                 <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
              </div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+2.1% from last month</p>
           </div>
           
           <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm shrink-0 w-[80%] md:w-auto snap-center">
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-4">Cash Burn</p>
              <div className="flex items-end gap-2 mb-2">
                 <p className="text-3xl font-black text-text-primary tracking-tighter">₹{metrics.totalExpenses?.toLocaleString()}</p>
                 <TrendingDown className="w-5 h-5 text-rose-500 mb-1" />
              </div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">-₹4,500 vs average</p>
           </div>

           <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm shrink-0 w-[80%] md:w-auto snap-center">
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-4">Passive Ratio</p>
              <div className="flex items-end gap-2 mb-2">
                 <p className="text-3xl font-black text-text-primary tracking-tighter">4.2%</p>
              </div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">Yielding Assets</p>
           </div>

           <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm shrink-0 w-[80%] md:w-auto snap-center">
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-4">Financial Score</p>
              <div className="flex items-end gap-2 mb-2">
                 <p className="text-3xl font-black text-primary tracking-tighter">780</p>
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-relaxed">Exceptional standing</p>
           </div>
        </section>

        {/* Main Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 bg-surface border border-border rounded-[2.5rem] p-8 min-h-[400px]">
              <div className="flex items-center justify-between mb-10 px-4">
                 <h3 className="text-xl font-black text-text-primary tracking-tight">Spending Breakdown</h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                       <div className="w-3 h-3 rounded-sm bg-primary" /> Volume
                    </div>
                 </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={range === "Weekly" ? metrics.charts.daily : metrics.charts.monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#F8FAFC'
                      }}
                      formatter={(val: any) => `₹${Number(val).toLocaleString()}`}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={range === "Weekly" ? 40 : 60}>
                      {(range === "Weekly" ? metrics.charts.daily : metrics.charts.monthly).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === (range === "Weekly" ? 6 : 5) ? "#2DD4BF" : "#1e293b"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#044E45] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                 <div className="relative z-10">
                    <h4 className="font-black text-lg mb-4 tracking-tight leading-tight">Tax Prediction</h4>
                    <p className="text-white/70 text-sm font-medium mb-8 leading-relaxed">
                       Based on current income level, your projected tax liability for Q1 is ₹1,42,000.
                    </p>
                    <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all">
                       Optimize Liability
                    </button>
                 </div>
              </div>

              <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h4 className="font-black text-lg text-text-primary">Reports Archive</h4>
                    <Share2 className="w-4 h-4 text-text-secondary" />
                 </div>
                 <div className="space-y-4">
                    {[
                      { name: "Annual Summary 2023", size: "2.4 MB" },
                      { name: "Q4 Investment Audit", size: "1.1 MB" },
                      { name: "Monthly Digest - Feb", size: "0.8 MB" },
                    ].map((rep, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                               <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-text-primary">{rep.name}</span>
                         </div>
                         <span className="text-[10px] font-bold text-text-secondary opacity-50">{rep.size}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
