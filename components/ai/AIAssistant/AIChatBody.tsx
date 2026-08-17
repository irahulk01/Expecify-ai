import { motion, AnimatePresence } from "framer-motion";
import { Bot, User } from "lucide-react";
import { formatAiMessage } from "@/components/ai/formatAiMessage";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
};

interface AIChatBodyProps {
  messages: Message[];
  isTyping: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function AIChatBody({ messages, isTyping, messagesContainerRef }: AIChatBodyProps) {
  return (
    <div
      ref={messagesContainerRef as any}
      className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                msg.role === "assistant" ? "bg-(--ai-gradient)" : "bg-surface border border-border"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-3 h-3 text-white" />
              ) : (
                <User
                  className={`w-3 h-3 ${msg.role === "user" ? "text-text-primary" : "text-text-primary"}`}
                />
              )}
            </div>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-[1.25rem] text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-br-sm shadow-md"
                  : "bg-background/40 backdrop-blur-xl border border-border text-text-primary rounded-bl-sm shadow-xl"
              }`}
            >
              {msg.imageUrl && (
                <div className="mb-3 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                  <img
                    src={msg.imageUrl}
                    alt="Uploaded receipt"
                    className="max-h-40 w-auto object-contain bg-black/10"
                  />
                </div>
              )}
              <div
                className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : "dark:prose-invert prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-td:align-middle"}`}
                dangerouslySetInnerHTML={{
                  __html: msg.role === "user" ? msg.content : formatAiMessage(msg.content),
                }}
              />
              <p className="text-[10px] opacity-40 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-(--ai-gradient) shrink-0 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="px-3.5 py-3 bg-surface border border-border rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
