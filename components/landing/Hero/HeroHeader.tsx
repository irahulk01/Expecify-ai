import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, ShieldCheck, TrendingUp } from "lucide-react";

export function HeroHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="lg:col-span-6 space-y-8 text-center lg:text-left"
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs font-bold text-brand shadow-md backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
        <span>Next-Gen Streaming Financial AI</span>
        <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
      </div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-text-primary">
        Master Your Money with <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand via-brand-light to-cyan-500">
          Conversational AI
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-text-secondary font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
        Log expenses, monitor safe-to-spend budgets, and clear debts just by chatting. Powered by
        high-speed streaming AI and automated ledger intelligence.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
        <Link
          href="/register"
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand to-brand-light text-white font-black text-sm rounded-2xl shadow-lg shadow-brand/25 hover:brightness-110 hover:shadow-brand/40 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-8 py-4 bg-surface hover:bg-surface-hover border border-border text-text-primary font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 backdrop-blur-md"
        >
          Sign In to Dashboard
        </Link>
      </div>

      {/* Feature Highlights */}
      <div className="pt-6 border-t border-border grid grid-cols-3 gap-4 text-left">
        <div>
          <p className="text-xl font-black text-text-primary flex items-center gap-1">
            <Zap className="w-4 h-4 text-brand" /> Fast
          </p>
          <p className="text-xs font-semibold text-text-secondary mt-1">Real-time Stream</p>
        </div>
        <div>
          <p className="text-xl font-black text-text-primary flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-brand" /> 100%
          </p>
          <p className="text-xs font-semibold text-slate-400 mt-1">Private & Safe</p>
        </div>
        <div>
          <p className="text-xl font-black text-text-primary flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-brand" /> ₹ INR
          </p>
          <p className="text-xs font-semibold text-text-secondary mt-1">Indian Currency</p>
        </div>
      </div>
    </motion.div>
  );
}
