"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, SendHorizonal, Sparkles, Loader2, User, Bot, MicOff, AlertCircle, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

// ─── Speech Recognition Types ────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

const SUGGESTIONS = [
  "Add ₹150 for lunch",
  "What did I spend this week?",
  "What's my balance?",
  "Add ₹300 for groceries",
];

const WAVE_HEIGHTS = [30, 70, 50, 90, 45, 80, 35, 100, 60, 75, 40, 85, 55, 95, 30, 65, 80, 45, 70, 50];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hi! I'm your **Expensify AI**. Try saying **'Lunch 150'** or **'Chicken rice 120'**. I'll auto-track everything for you. How can I help today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTextRef = useRef("");
  const sentThisSessionRef = useRef(false);
  const isMessageSendingRef = useRef(false);
  const messagesRef = useRef<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, interimText]);

  // Sound preference persistence
  useEffect(() => {
    const saved = localStorage.getItem("ai-sound-on");
    if (saved !== null) setIsSoundOn(saved === "true");
  }, []);

  const toggleSound = () => {
    const newVal = !isSoundOn;
    setIsSoundOn(newVal);
    localStorage.setItem("ai-sound-on", String(newVal));
    if (!newVal) window.speechSynthesis.cancel();
  };

  const speak = useCallback((text: string) => {
    if (!isSoundOn) return;
    window.speechSynthesis.cancel();
    // Strip markdown/html
    const cleanText = text.replace(/<[^>]*>/g, "").replace(/\*\*/g, "").replace(/₹/g, "Rupees");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }, [isSoundOn]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant" && lastMsg.id !== "init") {
      speak(lastMsg.content);
    }
  }, [messages, speak]);

  const stopRecognition = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isMessageSendingRef.current) return;
    
    isMessageSendingRef.current = true;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setInterimText("");
    setIsTyping(true);

    try {
      const historyForApi = messagesRef.current.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      historyForApi.push({ role: userMsg.role, content: userMsg.content });

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi }),
      });

      const data = await res.json();
      const reply: string = res.ok ? (data.content || data.reply) : "Sorry, I couldn't process that. Please try again.";

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: reply, timestamp: new Date() },
      ]);
      
      if (data.action || reply.includes("✅") || reply.includes("Logged") || reply.includes("Saved") || reply.includes("Updated")) {
        window.dispatchEvent(new CustomEvent("dashboard-update"));
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Network error — please check your connection.", timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
      isMessageSendingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleOpenAI = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        setTimeout(() => {
          sendMessage(customEvent.detail.prompt);
        }, 400);
      }
    };
    window.addEventListener("open-ai", handleOpenAI);
    return () => window.removeEventListener("open-ai", handleOpenAI);
  }, [sendMessage]);

  const startRecognition = useCallback(async () => {
    setVoiceError(null);
    setInterimText("");
    setIsListening(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError("Your browser does not support Speech Recognition.");
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Set to English (India) for better accent support

      recognition.onstart = () => {
        sentThisSessionRef.current = false;
        currentTextRef.current = "";
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        setInterimText(transcript);
        currentTextRef.current = transcript;

        // Reset silence timer on every result
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          stopRecognition();
        }, 3000); // 3-second window
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setVoiceError("Microphone access denied.");
        } else {
          setVoiceError(`Error: ${event.error}`);
        }
        stopRecognition();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        const textToSend = currentTextRef.current.trim();
        if (textToSend && !sentThisSessionRef.current) {
          sentThisSessionRef.current = true;
          sendMessage(textToSend);
          setInterimText("");
          currentTextRef.current = "";
        }
      };

      recognition.start();

      // Initial silence timer: if they don't speak at all for 8s, stop.
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        stopRecognition();
      }, 8000);
      
    } catch (err) {
      console.error("Failed to start recognition", err);
      setVoiceError("Failed to start voice recognition.");
      setIsListening(false);
    }
  }, [sendMessage, stopRecognition]);

  const handleMicClick = () => {
    if (isListening) stopRecognition();
    else startRecognition();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) sendMessage(input);
  };

  if (!isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50 group cursor-pointer"
          style={{ width: 72, height: 72 }}
          onClick={() => setIsOpen(true)}
        >
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-10px] rounded-full bg-cyan-500/30 blur-xl pointer-events-none"
          />

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-full h-full rounded-full shadow-[0_0_30px_rgba(14,165,233,0.5)] overflow-hidden border-[3px] border-white/20 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700"
            style={{ borderRadius: "50%" }}
          >
            {/* Dynamic Water Waves */}
            <motion.div
              animate={{ y: ["-5%", "5%", "-5%"], rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-[35%] left-[-50%] w-[200%] h-[200%] bg-cyan-300/30 rounded-[43%] mix-blend-overlay backdrop-blur-sm"
              style={{ transformOrigin: "center" }}
            />
            <motion.div
              animate={{ y: ["5%", "-5%", "5%"], rotate: [360, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-[45%] left-[-50%] w-[200%] h-[200%] bg-blue-400/30 rounded-[40%] mix-blend-overlay"
              style={{ transformOrigin: "center" }}
            />
            <motion.div
              animate={{ y: ["0%", "8%", "0%"], rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute top-[55%] left-[-50%] w-[200%] h-[200%] bg-indigo-300/40 rounded-[38%] mix-blend-overlay"
              style={{ transformOrigin: "center" }}
            />

            {/* Traveling Particles (Bubbles) */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [60, -80],
                  x: [Math.sin(i * 45) * 15, -Math.sin(i * 45) * 15],
                  opacity: [0, 1, 0],
                  scale: [0.3, 1.2, 0.3]
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2
                }}
                className="absolute w-1.5 h-1.5 bg-white/80 rounded-full blur-[0.5px] mix-blend-screen shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  bottom: "-10%"
                }}
              />
            ))}

            {/* Center light core / Sun reflection */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] left-[15%] w-[70%] h-[70%] bg-gradient-to-br from-white/40 to-transparent rounded-full blur-md"
            />

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Sparkles className="w-7 h-7 text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)] group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Lens flare ring */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] pointer-events-none border border-white/30" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const containerClasses = isListening
    ? "fixed inset-0 z-[100] backdrop-blur-3xl bg-black/60 flex flex-col items-center justify-center p-4 md:p-12 transition-all duration-500"
    : "fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] transition-all duration-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={containerClasses}
    >
      <div className={`glass-panel relative overflow-hidden flex flex-col w-full shadow-2xl border border-white/10 ${isListening ? "max-w-3xl h-full max-h-[800px] rounded-[2.5rem]" : "h-full rounded-3xl"}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-bl-full pointer-events-none blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 p-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-(--ai-gradient) flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm leading-none">Expensify AI</h2>
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
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                msg.role === "assistant" ? "bg-(--ai-gradient)" : "bg-surface border border-border"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-3 h-3 text-white" /> : <User className={`w-3 h-3 ${msg.role === "user" ? "text-text-primary" : "text-text-primary"}`} />}
              </div>
              <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-sm shadow-md"
                  : "bg-surface border border-border text-text-primary rounded-bl-sm shadow-sm"
              }`}>
                <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                <p className="text-[10px] opacity-40 mt-1 text-right">
                  {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
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
        <div ref={messagesEndRef} />
      </div>

      <div className="relative z-10 px-4 pb-2 flex gap-1.5 overflow-x-auto">
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
        {isListening && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            className="relative z-10 overflow-hidden px-6 flex flex-col justify-center items-center bg-background/40 border-t border-border backdrop-blur-xl"
          >
            <div className="flex flex-col items-center gap-6 w-full max-w-lg text-center py-6">
              <div className="flex items-center justify-center gap-[6px] h-12 w-full">
                {WAVE_HEIGHTS.map((maxH, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.15, maxH / 100, 0.15], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.35 + (i % 5) * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
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
                      <span className="opacity-30 italic text-text-primary">Start speaking your expense...</span>
                    )}
                  </motion.p>
                </div>
              </div>
            </div>
            <button onClick={handleMicClick} className="absolute bottom-4 right-6 text-xs bg-background/5 border border-border hover:bg-background/10 text-text-primary px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg">
              <MicOff className="w-3.5 h-3.5" /> Stop Listening
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {voiceError && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="relative z-10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{voiceError}</span>
              <button onClick={() => setVoiceError(null)} className="ml-auto text-red-400/60 hover:text-red-400 font-bold">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative z-10 flex items-center gap-2 p-3 border-t border-border bg-surface/30">
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isTyping}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 relative ${
            isListening
              ? "bg-error shadow-lg shadow-error/40"
              : "bg-background border border-border hover:bg-surface disabled:opacity-30"
          }`}
        >
          {isListening ? (
            <>
              <span className="absolute inset-0 rounded-xl animate-ping bg-error/30" />
              <MicOff className="w-4 h-4 text-white relative z-10" />
            </>
          ) : (
            <Mic className="w-4 h-4 text-text-secondary" />
          )}
        </button>

        <textarea
          value={isListening ? interimText : input}
          onChange={(e) => !isListening && setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() && !isTyping && !isListening) handleSubmit(e as any);
            }
          }}
          readOnly={isListening}
          placeholder={isListening ? "Listening to your voice..." : "Ask Expensify AI..."}
          rows={Math.min((input.match(/\n/g) || []).length + 1, 4)}
          className={`flex-1 border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none transition-all resize-none scrollbar-none ${
            isListening
              ? "bg-primary/5 border-primary/30 cursor-not-allowed text-primary"
              : "bg-background border-border focus:border-primary/50"
          }`}
        />

        <button
          type="submit"
          disabled={!input.trim() || isTyping || isListening}
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 hover:brightness-110 disabled:opacity-30 transition-all shadow-sm"
        >
          {isTyping
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : <SendHorizonal className="w-4 h-4 text-white" />}
        </button>
      </form>
      </div>
    </motion.div>
  );
}
