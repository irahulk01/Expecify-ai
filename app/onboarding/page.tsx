"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Send, Mic, MicOff, Sparkles, ArrowRight, Pencil } from "lucide-react";

// Simple markdown renderer (bold + line breaks)
function SimpleMarkdown({ text }: { text?: string }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-bold text-text-primary">
            {p.slice(2, -2)}
          </strong>
        ) : (
          p.split("\n").map((line, j) => (
            <span key={`${i}-${j}`}>
              {j > 0 && <br />}
              {line}
            </span>
          ))
        )
      )}
    </span>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function OnboardingPage() {
  const [userName, setUserName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [dots, setDots] = useState("");
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Get initial state
  useEffect(() => {
    const fetchState = async () => {
      setLoading(true);
      const res = await fetch("/api/onboarding");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data.completed) {
        window.location.href = "/dashboard";
        return;
      }

      setUserName(data.userName);

      if (data.history && data.history.length > 0) {
        setMessages(data.history);
        setLoading(false);
      } else {
        // Init chat
        const startRes = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: data.userName, history: [], message: null }),
        });
        const startData = await startRes.json();
        setMessages([{ role: "assistant", content: startData.reply }]);
        setLoading(false);
      }
    };
    fetchState();
  }, []);

  // Animate loading dots
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleEdit = (index: number) => {
    if (loading || done) return;
    const msgToEdit = messages[index];
    if (msgToEdit.role !== "user") return;

    // Slice off this message and everything after it
    setMessages(messages.slice(0, index));
    setInput(msgToEdit.content);
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || done) return;

    const userMsg: Message = { role: "user", content: msg };
    const history = [...messages];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          message: msg,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `**Error:** ${data.error}` },
        ]);
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setLoading(false);

      const isComplete =
        data.done ||
        data.reply?.toLowerCase().includes("dashboard ready") ||
        data.reply?.toLowerCase().includes("ready for you");

      if (isComplete) {
        setDone(true);
        setTimeout(() => {
          router.push("/dashboard");
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "**Error:** Failed to connect to AI server." },
      ]);
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r: any = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-IN";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setListening(false);
      send(t);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-brand/10 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[5%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-gradient-to-br from-brand via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand/30">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-text-primary font-bold text-2xl tracking-tight">monityai.com</span>
      </div>

      {/* Chat container */}
      <div
        className="relative z-10 w-full max-w-2xl bg-surface/90 backdrop-blur-xl rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col"
        style={{ height: "min(600px, 80vh)" }}
      >
        {/* Title bar */}
        <div className="px-6 py-4 border-b border-border bg-surface flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface" />
          </div>
          <div>
            <p className="text-text-primary text-sm font-semibold">Gemini AI</p>
            <p className="text-text-secondary text-xs">Setting up your dashboard</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-none">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-brand flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand text-white font-medium rounded-br-sm shadow-sm"
                      : "bg-background-alt text-text-primary border border-border rounded-bl-sm shadow-xs"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <span className="leading-relaxed text-text-primary">
                      <SimpleMarkdown text={msg.content} />
                    </span>
                  ) : (
                    <div className="flex items-center gap-3 group/msg">
                      <span>{msg.content}</span>
                      <button
                        onClick={() => handleEdit(i)}
                        disabled={loading || done}
                        className="opacity-0 group-hover/msg:opacity-100 p-1 hover:bg-white/20 rounded transition-all disabled:hidden"
                        title="Edit message"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-brand flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-background-alt border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-text-secondary text-sm min-w-[60px]">
                Thinking{dots}
              </div>
            </motion.div>
          )}

          {/* Done state */}
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <ArrowRight className="w-4 h-4 animate-bounce" />
                Dashboard ready! Redirecting you now…
              </div>
              <button
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand/30 transition-all flex items-center gap-2"
              >
                Go to Dashboard Now <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-4 border-t border-border bg-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={toggleVoice}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                listening
                  ? "bg-red-500/20 text-red-500 ring-1 ring-red-500/40 animate-pulse"
                  : "bg-background border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !loading && !done) {
                    send();
                  }
                }
              }}
              placeholder={done ? "All done!" : "Type your answer…"}
              disabled={loading || done}
              autoFocus
              rows={Math.min((input.match(/\n/g) || []).length + 1, 4)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand/50 disabled:opacity-40 transition-all resize-none scrollbar-none"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || loading || done}
              className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand/30 shrink-0"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-text-secondary text-xs text-center">
        This takes less than 2 minutes · Your data is private and secure
      </p>
    </div>
  );
}
