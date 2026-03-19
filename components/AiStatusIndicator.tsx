"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

export default function AiStatusIndicator() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Only fetch once when component mounts
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/ai/status");
        const data = await res.json();
        
        if (data.connected) {
          setStatus("connected");
        } else {
          setStatus("disconnected");
          setErrorMsg(data.error || "Unknown Error");
        }
      } catch (err) {
        setStatus("disconnected");
        setErrorMsg("Failed to reach server");
      }
    };
    checkStatus();
  }, []);

  if (status === "checking") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end group">
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-md transition-all ${
          status === "connected" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {status === "connected" ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          )}
        </span>
        <span className="text-xs font-medium">
          {status === "connected" ? "AI Connected" : "AI Disconnected"}
        </span>
        {status === "connected" ? (
          <Wifi className="w-3.5 h-3.5 ml-1" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 ml-1" />
        )}
      </div>

      {status === "disconnected" && (
        <div className="mt-2 text-[10px] text-red-400/80 bg-background-dark/80 px-2 py-1 rounded max-w-[200px] text-right opacity-0 group-hover:opacity-100 transition-opacity">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
