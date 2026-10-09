import React, { useState, useRef, useEffect } from 'react';
import { apiChat } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { Bot, X, Send, CornerDownRight, Loader2 } from 'lucide-react';

export const ChatDrawer: React.FC = () => {
  const { userRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const getDrawerGreeting = (role: string | null | undefined) => {
    if (role === 'admin') {
      return {
        text: 'Hello Administrator! Need quick system or inventory telemetry? Ask about valuation, shortages, or active operations.',
        suggestions: ['Items low in stock', 'Total inventory valuation', 'Active suppliers'],
      };
    }
    if (role === 'inventory_manager') {
      return {
        text: 'Hello Manager! Need quick inventory telemetry? Ask about shortages, suppliers, or demand projections.',
        suggestions: ['Items low in stock', 'Inventory valuation', 'Forecast demand next 30 days'],
      };
    }
    return {
      text: 'Hello Operator! Need quick floor telemetry? Ask about product bay locations, item balances, or barcodes.',
      suggestions: ['Storage bay for an SKU', 'Check item balance', 'Barcode scanner guide'],
    };
  };

  const initialConfig = getDrawerGreeting(userRole);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'drawer-init',
      sender: 'assistant',
      text: initialConfig.text,
      timestamp: 'Now',
      suggestions: initialConfig.suggestions,
    },
  ]);

  useEffect(() => {
    const config = getDrawerGreeting(userRole);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'drawer-init') {
        return [
          {
            id: 'drawer-init',
            sender: 'assistant',
            text: config.text,
            timestamp: 'Now',
            suggestions: config.suggestions,
          },
        ];
      }
      return prev;
    });
  }, [userRole]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Now',
    };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiChat.sendMessage(text);
      setMessages((p) => [
        ...p,
        {
          id: `b-${Date.now()}`,
          sender: 'assistant',
          text: res.reply,
          timestamp: 'Now',
          suggestions: res.suggestions,
        },
      ]);
    } catch (e: any) {
      setMessages((p) => [
        ...p,
        {
          id: `b-err-${Date.now()}`,
          sender: 'assistant',
          text: `Error: ${e.message}`,
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[#6C4CE6] hover:bg-[#5839D6] text-white shadow-lg shadow-[#6C4CE6]/30 flex items-center justify-center hover:scale-105 transition-all cursor-pointer border border-white/20"
        title="StockSense AI Copilot"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </button>

      {/* Floating Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-96 max-w-[calc(100vw-2.5rem)] h-[480px] bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-3xl shadow-2xl shadow-[#6C4CE6]/15 dark:shadow-none flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#FAF9FD] dark:bg-[#1B172E] border-b border-[#E8E5F2] dark:border-[#282342] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6C4CE6] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                StockSense AI Copilot
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[88%] ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-[#6C4CE6] text-white shadow-xs'
                      : 'bg-[#FAF9FD] dark:bg-[#1B172E] border border-[#E8E5F2] dark:border-[#282342] text-slate-800 dark:text-slate-100 shadow-2xs'
                  }`}
                >
                  {m.text}
                </div>

                {m.suggestions && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(s)}
                        className="px-2.5 py-1 bg-[#F0EDFD] hover:bg-[#E8E5F2] dark:bg-[#252040] dark:hover:bg-[#2E2850] text-[#6C4CE6] dark:text-[#A78BFA] rounded-lg text-[11px] font-medium cursor-pointer text-left transition-colors flex items-center gap-1"
                      >
                        <CornerDownRight className="w-3 h-3 opacity-60" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="self-start text-slate-500 dark:text-[#A5A1BE] text-xs flex items-center gap-2 p-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C4CE6]" />
                <span>Querying warehouse ledger...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-2.5 bg-[#FAF9FD] dark:bg-[#1B172E] border-t border-[#E8E5F2] dark:border-[#282342] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an inventory question..."
              className="flex-1 h-9 px-3 bg-white dark:bg-[#141124] border border-[#E8E5F2] dark:border-[#282342] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-[#6C4CE6] shadow-2xs"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 px-3 bg-[#6C4CE6] hover:bg-[#5839D6] text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition-colors flex items-center justify-center shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
