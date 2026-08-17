"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useAiStream(initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [demoCount, setDemoCount] = useState<number>(0);

  useEffect(() => {
    const savedCount = localStorage.getItem("expecify_demo_count");
    if (savedCount) {
      setDemoCount(parseInt(savedCount, 10) || 0);
    }
  }, []);

  const streamMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      setIsStreaming(true);

      const userMsgObj: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsgObj: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsgObj, assistantMsgObj]);

      const newDemoCount = demoCount + 1;
      setDemoCount(newDemoCount);
      localStorage.setItem("expecify_demo_count", newDemoCount.toString());

      const requestMessages = [...messages, userMsgObj].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages, demoCount: newDemoCount }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to AI stream API.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: streamedContent } : msg
          )
        );
      }

      return streamedContent;
    },
    onSettled: () => {
      setIsStreaming(false);
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isStreaming) return;
      streamMutation.mutate(content.trim());
    },
    [isStreaming, streamMutation]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    demoCount,
    sendMessage,
    clearMessages,
    error: streamMutation.error,
  };
}
