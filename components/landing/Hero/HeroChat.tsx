"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, CheckCircle2, Lock } from "lucide-react";
import { useAiStream } from "@/lib/useAiStream";
import { HeroDemoLimitModal } from "./HeroDemoLimitModal";
import { HeroChatMessageItem } from "./HeroChatMessageItem";

const SUGGESTED_PROMPTS = [
  "Spent ₹350 on Dinner",
  "Set my monthly salary to ₹85,000",
  "What is my safe-to-spend balance?",
  "Add ₹1,200 Electricity Bill due Aug 25",
];

const FULL_WELCOME_TEXT =
  "Hi! I'm **Expecify AI** 🚀. Type any expense like **'Spent 450 on Coffee'** or click a prompt below to see real-time AI tracking in action!";

export function HeroChat() {
  const [input, setInput] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [isTypingWelcome, setIsTypingWelcome] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= FULL_WELCOME_TEXT.length) {
        setWelcomeText(FULL_WELCOME_TEXT.slice(0, idx));
        idx += 2;
      } else {
        setWelcomeText(FULL_WELCOME_TEXT);
        setIsTypingWelcome(false);
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const { messages, isStreaming, demoCount, sendMessage } = useAiStream([
    {
      id: "welcome-hero",
      role: "assistant",
      content: FULL_WELCOME_TEXT,
      timestamp: new Date(),
    },
  ]);

  const isDemoLimitReached = demoCount >= 10;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || isDemoLimitReached) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    if (isStreaming || isDemoLimitReached) return;
    sendMessage(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="lg:col-span-6"
    >
      <div className="relative bg-surface/90 border border-border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col h-[540px] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-text-primary tracking-tight">
                  Expecify AI Assistant
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                Streaming Active •{" "}
                {isDemoLimitReached
                  ? "Demo Max Reached (10/10)"
                  : `Demo Questions: ${demoCount}/10`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border text-[10px] font-bold text-brand">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Live Product Demo
          </div>
        </div>

        {/* Chat Message Scrollable Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <HeroChatMessageItem
                key={msg.id}
                msg={msg}
                isLastMsg={index === messages.length - 1}
                isStreaming={isStreaming}
                isTypingWelcome={isTypingWelcome}
                welcomeText={welcomeText}
              />
            ))}
          </AnimatePresence>

          {isDemoLimitReached && <HeroDemoLimitModal />}
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2 border-t border-border bg-background-alt/50 flex gap-2 overflow-x-auto hide-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt)}
              disabled={isStreaming || isDemoLimitReached}
              className="text-[11px] font-bold whitespace-nowrap px-3 py-1.5 rounded-xl bg-background hover:bg-surface border border-border hover:border-brand/40 text-text-secondary hover:text-brand transition-all shrink-0 disabled:opacity-40"
            >
              + {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-surface border-t border-border flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isDemoLimitReached
                ? "Demo limit reached (10/10). Please sign up!"
                : "Ask or log an expense e.g. 'Lunch ₹250'..."
            }
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
            disabled={isStreaming || isDemoLimitReached}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming || isDemoLimitReached}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand to-brand-light text-white font-bold flex items-center justify-center shrink-0 hover:brightness-110 disabled:opacity-40 transition-all shadow-md"
          >
            {isDemoLimitReached ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
