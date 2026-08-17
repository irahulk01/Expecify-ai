import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { formatAiMessage } from "@/components/ai/formatAiMessage";

interface HeroChatMessageItemProps {
  msg: { id: string; role: string; content: string };
  isLastMsg: boolean;
  isStreaming: boolean;
  isTypingWelcome: boolean;
  welcomeText: string;
}

export function HeroChatMessageItem({
  msg,
  isLastMsg,
  isStreaming,
  isTypingWelcome,
  welcomeText,
}: HeroChatMessageItemProps) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-md ${
          isUser
            ? "bg-surface-hover text-text-primary border border-border"
            : "bg-gradient-to-br from-brand to-brand-light text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
          isUser
            ? "bg-brand text-white font-bold rounded-tr-none shadow-md"
            : "bg-background-alt border border-border text-text-primary rounded-tl-none shadow-sm"
        }`}
      >
        <div
          className={`prose ${isUser ? "prose-invert" : "dark:prose-invert"} max-w-none text-xs sm:text-sm leading-relaxed`}
          dangerouslySetInnerHTML={{
            __html: isUser
              ? msg.content
              : msg.id === "welcome-hero"
                ? formatAiMessage(welcomeText)
                : formatAiMessage(msg.content),
          }}
        />
        {((!isUser && isStreaming && isLastMsg) ||
          (msg.id === "welcome-hero" && isTypingWelcome)) && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-brand animate-pulse align-middle" />
        )}
      </div>
    </motion.div>
  );
}
