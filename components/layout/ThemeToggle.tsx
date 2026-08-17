"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-surface/50 border border-border/50 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-surface/80 hover:bg-surface border border-border/80 hover:border-brand/50 shadow-sm transition-all duration-300 group overflow-hidden active:scale-95"
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      aria-label="Toggle theme"
    >
      {/* Background Soft Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 to-brand-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: -16, opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: 16, opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-brand-light drop-shadow-[0_0_8px_rgba(155,123,246,0.5)] transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Classy Sparkle Accent Ring */}
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand animate-pulse opacity-75" />
    </button>
  );
}
