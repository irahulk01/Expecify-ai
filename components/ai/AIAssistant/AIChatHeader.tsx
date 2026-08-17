import { Sparkles, Volume2, VolumeX, X } from "lucide-react";

interface AIChatHeaderProps {
  isSoundOn: boolean;
  toggleSound: () => void;
  isListening: boolean;
  onClose: () => void;
}

export function AIChatHeader({ isSoundOn, toggleSound, isListening, onClose }: AIChatHeaderProps) {
  return (
    <div className="relative z-10 flex items-center gap-3 p-5 border-b border-border">
      <div className="w-9 h-9 rounded-xl bg-(--ai-gradient) flex items-center justify-center shadow-lg shadow-primary/30">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div>
        <h2 className="font-bold text-white text-sm leading-none">monityai.com</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Your Personal Finance Assistant</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleSound}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSoundOn ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-500 hover:text-slate-300"}`}
          title={isSoundOn ? "Mute Assistant" : "Unmute Assistant"}
        >
          {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-1.5 px-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-red-400 animate-pulse" : "bg-green-400"}`}
          />
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
