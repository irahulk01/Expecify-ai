"use client";

import { useState, useEffect } from "react";
import { Landmark, Plus, CreditCard, Banknote, RefreshCw, MoreVertical, Edit2, Trash2, Search, Mic, Bell } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Debt {
  id: string;
  title: string;
  category: string;
  totalAmount: number;
  remainingAmount: number;
  createdAt: string;
}

export default function DebtsPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Loan");

  const { data: debts = [], isLoading: loading, refetch } = useQuery<Debt[]>({
    queryKey: ['debts'],
    queryFn: async () => {
      const r = await fetch("/api/debts");
      if (!r.ok) throw new Error("Failed to fetch debts");
      return r.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (newDebt: any) => {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDebt),
      });
      if (!response.ok) throw new Error("Failed to add debt");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTitle("");
      setAmount("");
      setIsAdding(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/debts?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete debt");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setActivePopup(null);
      setDeleteConfirmId(null);
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    };
    window.addEventListener("dashboard-update", handleUpdate);
    return () => window.removeEventListener("dashboard-update", handleUpdate);
  }, [queryClient]);


  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    mutation.mutate({ title, category, totalAmount: Number(amount) });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "credit card": return <CreditCard className="w-5 h-5" />;
      default: return <Landmark className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background md:border-l border-border min-w-0 transition-colors">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50">
        <div className="w-full md:flex-1 md:max-w-2xl relative group flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder='Search debts...' 
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
            <button 
              onClick={() => refetch()} 
              className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? "Cancel" : "New Debt"}
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">Debt Management</h1>
            <p className="text-sm text-text-secondary font-medium tracking-tight opacity-70">Track and manage your loans, EMIs, and credit balances.</p>
          </div>
        </div>
        
        {isAdding && (
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl animate-in slide-in-from-top-4 fade-in duration-300">
            <h2 className="text-lg font-bold text-text-primary mb-4">Add Liability / Debt</h2>
            <form onSubmit={handleAddDebt} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required
                  placeholder="e.g. Car Loan"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="w-48">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Amount</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    required
                    placeholder="0.00"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="w-48">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="Loan">Loan</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="EMI">EMI</option>
                </select>
              </div>
              <button disabled={mutation.isPending} type="submit" className="px-6 py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50">
                {mutation.isPending ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-surface animate-pulse border border-border"></div>
             ))}
           </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-20 px-6 bg-surface border border-border border-dashed rounded-3xl">
             <Landmark className="w-12 h-12 text-text-secondary/50 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-text-primary mb-2">You are debt free!</h3>
             <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">You currently have no active loans or credit balances documented. Add one above to start tracking it.</p>
          </div>
        ) : (
        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-6 gap-6 md:grid md:grid-cols-2 md:mx-0 md:px-0 md:pb-0">
            {debts.map(debt => {
               const paidAmount = debt.totalAmount - debt.remainingAmount;
               const progress = Math.min(100, Math.max(0, (paidAmount / debt.totalAmount) * 100));
               
               return (
                 <div key={debt.id} className="relative bg-surface border border-border rounded-3xl p-6 hover:shadow-lg transition-all group shrink-0 w-[85%] md:w-auto snap-center">
                   <div className="flex justify-between items-start mb-6">
                     <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                         {getCategoryIcon(debt.category)}
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{debt.title}</h3>
                         <span className="text-xs font-medium text-text-secondary uppercase tracking-wider bg-background px-2 py-1 rounded-md mt-1 inline-block border border-border/50">
                           {debt.category}
                         </span>
                       </div>
                     </div>
                     <div className="relative">
                       <button 
                         onClick={() => setActivePopup(activePopup === debt.id ? null : debt.id)}
                         className="p-2 text-text-secondary hover:text-primary hover:bg-surface rounded-full transition-colors"
                       >
                         <MoreVertical className="w-5 h-5" />
                       </button>
                       {activePopup === debt.id && (
                         <div className="absolute right-0 top-10 w-48 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                           <div className="p-2 flex flex-col gap-1">
                             <button
                               onClick={() => {
                                 setActivePopup(null);
                                 // Dispatch custom event to open chat and prefill
                                 const event = new CustomEvent('open-ai', { 
                                   detail: { prompt: `Update payment for ${debt.title} by ₹...` }
                                 });
                                 window.dispatchEvent(event);
                               }}
                               className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-background rounded-xl transition-colors text-left"
                             >
                               <Edit2 className="w-4 h-4 text-primary" />
                               Edit via AI
                             </button>
                            <button
                               onClick={() => {
                                 setDeleteConfirmId(debt.id);
                                 setActivePopup(null);
                               }}
                               disabled={deleteMutation.isPending}
                               className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left disabled:opacity-50"
                             >
                               <Trash2 className="w-4 h-4" />
                               Delete
                             </button>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-text-secondary font-medium">Remaining to pay</p>
                          <p className="font-bold text-rose-500 text-lg">₹{debt.remainingAmount.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-text-secondary font-medium">Total Loan</p>
                          <p className="font-bold text-text-primary text-lg">₹{debt.totalAmount.toLocaleString("en-IN")}</p>
                        </div>
                     </div>

                     <div className="relative pt-2">
                       <div className="flex mb-2 items-center justify-between text-xs">
                          <div className="font-bold text-emerald-500">
                             Paid: ₹{paidAmount.toLocaleString("en-IN")}
                          </div>
                          <div className="font-bold text-text-secondary">
                             {progress.toFixed(1)}% cleared
                          </div>
                       </div>
                       <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-background border border-border inset-shadow-sm">
                          <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-linear-to-r from-emerald-500 to-emerald-400"></div>
                       </div>
                     </div>
                   </div>

                   {/* Absolute Delete Confirmation Overlay */}
                   {deleteConfirmId === debt.id && (
                     <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-3xl z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                       <Trash2 className="w-10 h-10 text-rose-500 mb-3" />
                       <h4 className="text-lg font-bold text-text-primary mb-1">Delete Debt?</h4>
                       <p className="text-sm text-text-secondary max-w-[200px] mb-6">Are you sure you want to delete this? This cannot be undone.</p>
                       <div className="flex items-center gap-3">
                         <button 
                           onClick={() => setDeleteConfirmId(null)}
                           disabled={deleteMutation.isPending}
                           className="px-4 py-2 text-sm font-bold text-text-secondary bg-surface border border-border rounded-xl hover:bg-background transition-colors disabled:opacity-50"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={() => deleteMutation.mutate(debt.id)}
                           disabled={deleteMutation.isPending}
                           className="px-4 py-2 text-sm font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50"
                         >
                           {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
