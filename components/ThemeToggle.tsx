"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  const modes = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex bg-surface/50 backdrop-blur-md border border-border p-1 rounded-2xl shadow-sm">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = theme === mode.key;
        
        return (
          <button
            key={mode.key}
            onClick={() => setTheme(mode.key)}
            className={`
              relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300
              ${isActive ? "text-primary shadow-inner" : "text-text-secondary hover:text-text-primary hover:bg-surface/50"}
            `}
            title={mode.label}
          >
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  layoutId="activeTheme"
                  className="absolute inset-0 bg-surface rounded-xl shadow-sm border border-border z-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </AnimatePresence>
            <Icon className={`w-4 h-4 relative z-10 ${isActive ? "scale-110" : "scale-100"} transition-transform`} />
          </button>
        );
      })}
    </div>
  );
}
