import { MicOff } from "lucide-react";
import { motion } from "framer-motion";

const WAVE_HEIGHTS = [
  30, 70, 50, 90, 45, 80, 35, 100, 60, 75, 40, 85, 55, 95, 30, 65, 80, 45, 70, 50,
];

interface AIChatListeningProps {
  interimText: string;
  handleMicClick: () => void;
}

export function AIChatListening({ interimText, handleMicClick }: AIChatListeningProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="relative z-10 overflow-hidden px-6 flex flex-col justify-center items-center bg-background/40 border-t border-border backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-lg text-center py-6">
        <div className="flex items-center justify-center gap-[6px] h-12 w-full">
          {WAVE_HEIGHTS.map((maxH, i) => (
            <motion.div
              key={i}
              animate={{ scaleY: [0.15, maxH / 100, 0.15], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.35 + (i % 5) * 0.07,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.03,
              }}
              style={{ transformOrigin: "center", height: "100%" }}
              className="w-[5px] rounded-full bg-(--ai-gradient) shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            />
          ))}
        </div>

        <div className="w-full space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Listening Live
          </p>
          <div className="min-h-[60px] flex items-center justify-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-(--ai-gradient) leading-tight italic"
            >
              {interimText.trim() ? (
                `"${interimText}"`
              ) : (
                <span className="opacity-30 italic text-text-primary">
                  Start speaking your expense...
                </span>
              )}
            </motion.p>
          </div>
        </div>
      </div>
      <button
        onClick={handleMicClick}
        className="absolute bottom-4 right-6 text-xs bg-background/5 border border-border hover:bg-background/10 text-text-primary px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg"
      >
        <MicOff className="w-3.5 h-3.5" /> Stop Listening
      </button>
    </motion.div>
  );
}
