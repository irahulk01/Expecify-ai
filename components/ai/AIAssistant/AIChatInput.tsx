import { X, Paperclip, Mic, MicOff, Loader2, SendHorizonal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isListening: boolean;
  interimText: string;
  isTyping: boolean;
  autoAdd: boolean;
  setAutoAdd: (val: boolean) => void;
  attachment: File | null;
  setAttachment: (val: File | null) => void;
  attachmentPreview: string | null;
  setAttachmentPreview: (val: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleMicClick: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function AIChatInput({
  input,
  setInput,
  isListening,
  interimText,
  isTyping,
  autoAdd,
  setAutoAdd,
  attachmentPreview,
  setAttachment,
  setAttachmentPreview,
  fileInputRef,
  handleMicClick,
  handleSubmit,
}: AIChatInputProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 flex flex-col gap-2 p-3 border-t border-border bg-surface/40 backdrop-blur-md"
    >
      {/* Attachment Preview Area */}
      <AnimatePresence>
        {attachmentPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative self-start mb-2"
          >
            <div className="relative group rounded-xl overflow-hidden border border-border shadow-sm">
              <img
                src={attachmentPreview}
                alt="Attached"
                className="max-h-24 w-auto object-contain bg-black/5"
              />
              <button
                type="button"
                onClick={() => {
                  setAttachment(null);
                  setAttachmentPreview(null);
                }}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef as any}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith("image/")) {
              setAttachment(file);
              setAttachmentPreview(URL.createObjectURL(file));
            }
          }}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isTyping || isListening}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 bg-background border border-border hover:bg-surface disabled:opacity-30"
        >
          <Paperclip className="w-4 h-4 text-text-secondary" />
        </button>

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
          placeholder={isListening ? "Listening to your voice..." : "Ask monityai.com..."}
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
          {isTyping ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <SendHorizonal className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Auto Add Toggle */}
      <div className="flex items-center gap-2 pl-1 pt-1 opacity-70 hover:opacity-100 transition-opacity">
        <label className="flex items-center gap-2 text-[10px] text-text-primary cursor-pointer uppercase tracking-wider font-bold">
          <input
            type="checkbox"
            checked={autoAdd}
            onChange={(e) => setAutoAdd(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-border bg-surface text-primary focus:ring-primary shadow-sm"
          />
          Auto-Log Receipts
        </label>
      </div>
    </form>
  );
}
