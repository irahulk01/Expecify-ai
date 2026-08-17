import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "@/components/ai/AIAssistant/AIChatBody";

export function useAIAssistantLogic() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [autoAdd, setAutoAdd] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMessageSendingRef = useRef(false);
  const messagesRef = useRef<Message[]>(messages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content:
          "Hi! I'm your **monityai.com**. Try saying **'Lunch 150'** or **'Chicken rice 120'**. I'll auto-track everything for you. How can I help today?",
        timestamp: new Date(),
      },
    ]);
    const saved = localStorage.getItem("ai-sound-on");
    if (saved !== null) setIsSoundOn(saved === "true");
  }, []);

  const toggleSound = () => {
    const newVal = !isSoundOn;
    setIsSoundOn(newVal);
    localStorage.setItem("ai-sound-on", String(newVal));
    if (!newVal) window.speechSynthesis.cancel();
  };

  const speak = useCallback(
    (text: string) => {
      if (!isSoundOn) return;
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/<[^>]*>/g, "")
        .replace(/\*\*/g, "")
        .replace(/₹/g, "Rupees");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-IN";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    },
    [isSoundOn]
  );

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant" && lastMsg.id !== "init") {
      speak(lastMsg.content);
    }
  }, [messages, speak]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isMessageSendingRef.current) return;
      isMessageSendingRef.current = true;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        let base64Image = null;
        if (attachment) {
          base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(attachment!);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
        }

        if (base64Image) {
          userMsg.imageUrl = base64Image;
          setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? userMsg : m)));
        }

        const historyForApi = messagesRef.current.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        historyForApi.push({ role: userMsg.role, content: userMsg.content });

        if (!base64Image) {
          const assistantId = (Date.now() + 1).toString();
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
          ]);
          setIsTyping(false);

          const res = await fetch("/api/ai/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: historyForApi }),
          });

          if (res.ok && res.body) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let streamedText = "";
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              streamedText += decoder.decode(value, { stream: true });
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: streamedText } : m))
              );
            }
            if (
              streamedText.includes("✅") ||
              streamedText.includes("Logged") ||
              streamedText.includes("Saved") ||
              streamedText.includes("Confirmed")
            ) {
              window.dispatchEvent(new CustomEvent("dashboard-update"));
              setTimeout(() => {
                setIsOpen(false);
              }, 1800);
            }
          }
        } else {
          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: historyForApi, image: base64Image, autoAdd }),
          });
          if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
          setAttachment(null);
          setAttachmentPreview(null);
          const data = await res.json();
          const reply = res.ok
            ? data.content || data.reply
            : "Sorry, I couldn't process that. Please try again.";
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: reply,
              timestamp: new Date(),
            },
          ]);
          if (
            data.action ||
            reply.includes("✅") ||
            reply.includes("Logged") ||
            reply.includes("Saved") ||
            reply.includes("Confirmed")
          ) {
            window.dispatchEvent(new CustomEvent("dashboard-update"));
            setTimeout(() => {
              setIsOpen(false);
            }, 1800);
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Network error — please check your connection.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
        isMessageSendingRef.current = false;
      }
    },
    [attachment, attachmentPreview, autoAdd]
  );

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    isTyping,
    isSoundOn,
    toggleSound,
    autoAdd,
    setAutoAdd,
    attachment,
    setAttachment,
    attachmentPreview,
    setAttachmentPreview,
    fileInputRef,
    sendMessage,
    messagesContainerRef,
  };
}
