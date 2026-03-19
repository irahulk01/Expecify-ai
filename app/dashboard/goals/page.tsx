"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Bell, Search, Target, Plane, Home, Car, TrendingUp, ChevronRight
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard`)
      .then(r => r.json())
      .then(d => {
        setGoals(d.goals || []);
        setLoading(false);
      });
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Plane": return Plane;
      case "Home": return Home;
      case "Car": return Car;
      default: return Target;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold text-text-secondary">
        Loading ambitions...
      </div>
    );
  }

  return (
    <div className="min-w-0 transition-all">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-10 py-6 flex items-center justify-between gap-8 border-b border-border/50">
        <div className="flex-1 max-w-2xl relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder='Find a goal...' 
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:shadow-md">
            <Bell className="w-5 h-5" />
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Define Goal
          </button>
        </div>
      </header>

      <main className="px-10 py-8 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">Ambitions & Goals</h1>
            <p className="text-sm text-text-secondary font-medium">Visualizing your future, one contribution at a time.</p>
          </div>
          <div className="bg-surface rounded-2xl px-6 py-4 border border-border flex items-center gap-6">
             <div>
                <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-1">Success Prob.</p>
                <p className="text-xl font-black text-emerald-500">84%</p>
             </div>
             <div className="w-px h-8 bg-border" />
             <div>
                <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-1">Monthly Req.</p>
                <p className="text-xl font-black text-text-primary">₹24,500</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {goals.map((goal, i) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const Icon = getIcon(goal.icon);
            return (
              <div key={i} className="bg-surface border border-border rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex items-start justify-between mb-10">
                    <div className={`w-20 h-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-current/5`}>
                       <Icon className="w-10 h-10" />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest mb-2">Target Date</p>
                       <p className="text-sm font-black text-text-primary">{goal.deadline ? new Date(goal.deadline).toLocaleDateString("en-IN", { month: 'long', year: 'numeric' }) : 'No Target'}</p>
                    </div>
                 </div>

                 <div className="mb-10">
                    <h4 className="text-2xl font-black text-text-primary mb-2 tracking-tight">{goal.title}</h4>
                    <div className="flex items-baseline gap-2">
                       <p className="text-3xl font-black text-primary tracking-tighter">₹{goal.currentAmount.toLocaleString()}</p>
                       <p className="text-sm font-bold text-text-secondary tracking-tight">of ₹{goal.targetAmount.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{Math.round(progress)}% ACHIEVED</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">₹{(goal.targetAmount - goal.currentAmount).toLocaleString()} REMAINING</p>
                    </div>
                    <div className="h-4 bg-background border border-border rounded-full overflow-hidden p-1">
                       <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                 </div>

                 <div className="mt-10 flex gap-4">
                    <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                       Contribute
                    </button>
                    <button className="px-6 py-4 bg-surface border border-border rounded-2xl font-black text-text-secondary hover:text-primary transition-all">
                       Settings
                    </button>
                 </div>
              </div>
            );
          })}
          
          <div className="border-2 border-dashed border-border rounded-[3rem] bg-linear-to-b from-surface to-background/50 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-primary/50 transition-all">
             <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all mb-6">
                <Plus className="w-8 h-8" />
             </div>
             <h4 className="text-lg font-black text-text-primary mb-2">Create New Ambition</h4>
             <p className="text-sm text-text-secondary font-medium px-10">Define a new financial target and let our AI suggest an optimal savings plan.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
