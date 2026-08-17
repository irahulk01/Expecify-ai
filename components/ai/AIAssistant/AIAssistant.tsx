"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIChatHeader } from "./AIChatHeader";
import { AIChatBody } from "./AIChatBody";
import { AIChatInput } from "./AIChatInput";
import { AIChatListening } from "./AIChatListening";
import { AIChatSuggestions } from "./AIChatSuggestions";
import { useAIAssistantLogic } from "@/lib/useAIAssistantLogic";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";

export default function AIAssistant() {
  const {
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
  } = useAIAssistantLogic();

  const { isListening, interimText, voiceError, startRecognition, stopRecognition, setVoiceError } =
    useSpeechRecognition(sendMessage);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, interimText, messagesContainerRef]);

  useEffect(() => {
    const handleOpenAI = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt === "__MIC__") {
        setTimeout(() => startRecognition(), 500);
      } else if (customEvent.detail?.prompt) {
        setTimeout(() => sendMessage(customEvent.detail.prompt), 400);
      }
    };
    window.addEventListener("open-ai", handleOpenAI);
    return () => window.removeEventListener("open-ai", handleOpenAI);
  }, [sendMessage, startRecognition, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-lg bg-surface border-t sm:border border-border sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <AIChatHeader
          isSoundOn={isSoundOn}
          toggleSound={toggleSound}
          isListening={isListening}
          onClose={() => setIsOpen(false)}
        />

        <AIChatBody
          messages={messages}
          isTyping={isTyping}
          messagesContainerRef={messagesContainerRef}
        />

        <AIChatSuggestions
          isListening={isListening}
          isTyping={isTyping}
          voiceError={voiceError}
          setVoiceError={setVoiceError}
          sendMessage={sendMessage}
        />

        <AnimatePresence>
          {isListening && (
            <AIChatListening interimText={interimText} handleMicClick={stopRecognition} />
          )}
        </AnimatePresence>

        <AIChatInput
          input={input}
          setInput={setInput}
          isListening={isListening}
          interimText={interimText}
          isTyping={isTyping}
          autoAdd={autoAdd}
          setAutoAdd={setAutoAdd}
          attachment={attachment}
          setAttachment={setAttachment}
          attachmentPreview={attachmentPreview}
          setAttachmentPreview={setAttachmentPreview}
          fileInputRef={fileInputRef}
          handleMicClick={isListening ? stopRecognition : startRecognition}
          handleSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        />
      </motion.div>
    </div>
  );
}
