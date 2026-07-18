import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Bot, User, Loader2 } from "lucide-react";
import { triggerHaptic } from "../lib/haptics";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Chatbot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hello Admin. I'm here to help manage your schedule, draft formal reminder emails, or answer any queries." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    triggerHaptic();
    
    const userText = input.trim();
    const newMessages = [...messages, { role: "user" as const, text: userText }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "bot" ? "model" : "user",
        parts: [{ text: m.text }]
      }));
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
      });
      const data = await res.json();
      
      setMessages([...newMessages, { role: "bot", text: data.text || "An error occurred." }]);
    } catch (err) {
      setMessages([...newMessages, { role: "bot", text: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-[1px]"
        onClick={() => { triggerHaptic(); onClose(); }}
      />
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] liquid-glass-heavy rounded-3xl flex flex-col overflow-hidden z-50 shadow-2xl text-slate-900 dark:text-white bg-slate-50/95 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10"
      >
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/60 dark:bg-black/40 text-slate-900 dark:text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <h3 className="font-semibold text-lg tracking-tight">Gemini Assistant</h3>
        </div>
        <button
          onClick={() => { triggerHaptic(); onClose(); }}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex flex-col max-w-[85%] ${m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white dark:bg-white/10 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-black/5 dark:border-white/5"
              }`}
            >
              {m.role === "bot" ? (
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-pre:bg-black/5 dark:prose-pre:bg-white/5 prose-pre:border prose-pre:border-black/10 dark:prose-pre:border-white/10">
                  <Markdown remarkPlugins={[remarkGfm]}>{m.text}</Markdown>
                </div>
              ) : (
                m.text
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-slate-500 text-sm p-2">
            <Loader2 size={14} className="animate-spin" /> Thinking...
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white/60 dark:bg-black/40 border-t border-black/5 dark:border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-full pl-4 pr-12 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all placeholder:text-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
    </>
  );
}
