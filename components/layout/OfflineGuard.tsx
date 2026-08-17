"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineGuard({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isOnline && (
          <motion.div
            key="offline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <WifiOff className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl font-black text-white mb-4 tracking-tight">
              Network Unavailable
            </h1>

            <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed mb-10 font-medium">
              monityai.com requires an active internet connection to securely sync your financial
              intelligence.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>

            <div className="absolute bottom-10 text-[10px] uppercase font-black tracking-widest text-slate-600">
              Offline Protection Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isOnline && children}
    </>
  );
}
