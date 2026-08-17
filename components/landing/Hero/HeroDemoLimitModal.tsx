import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

export function HeroDemoLimitModal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="p-5 my-3 rounded-2xl bg-surface border border-brand/30 text-center space-y-3 shadow-2xl relative overflow-hidden"
    >
      <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center mx-auto">
        <UserPlus className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-black text-text-primary">
          Unlock Unlimited AI Financial Tracking
        </h4>
        <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
          You&apos;ve completed 10 demo interactions! Create a free account to automatically track
          expenses, debts, and safe-to-spend budgets.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-1">
        <Link
          href="/register"
          className="px-5 py-2.5 bg-gradient-to-r from-brand to-brand-light text-white font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" /> Create Free Account
        </Link>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-background hover:bg-surface border border-border text-text-primary font-bold text-xs rounded-xl transition-all"
        >
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
