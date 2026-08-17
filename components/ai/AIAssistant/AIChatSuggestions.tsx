import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

const SUGGESTIONS = ["Spent 350 on Dinner", "Set my salary date to 1st", "What is my balance?"];

interface AIChatSuggestionsProps {
  isListening: boolean;
  isTyping: boolean;
  voiceError: string | null;
  setVoiceError: (err: string | null) => void;
  sendMessage: (text: string) => void;
}

export function AIChatSuggestions({
  isListening,
  isTyping,
  voiceError,
  setVoiceError,
  sendMessage,
}: AIChatSuggestionsProps) {
  return (
    <>
      <div className="relative z-10 px-4 pb-2 flex gap-1.5 overflow-x-auto hide-scrollbar">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={isListening || isTyping}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-surface hover:bg-primary/10 border border-border hover:border-primary/30 text-text-secondary hover:text-primary transition-all shrink-0 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{voiceError}</span>
              <button
                onClick={() => setVoiceError(null)}
                className="ml-auto text-red-400/60 hover:text-red-400 font-bold"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
