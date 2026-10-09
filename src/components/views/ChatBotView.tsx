import React, { useState, useRef, useEffect } from 'react';
import { apiChat } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react';

export const ChatBotView: React.FC = () => {
  const { userRole, userProfile } = useApp();

  const getRoleGreeting = (role: string | null | undefined) => {
    if (role === 'admin') {
      return {
        greeting: 'Hello Administrator!',
        roleText: 'connected live to your system command ledger.\n\nI can analyze company-wide valuation, audit operational movements, track team activities, and surface reorder telemetry.\n\nWhat would you like to explore today?',
        suggestions: [
          'Total inventory valuation & turnover',
          'Which items are critically low in stock?',
          'System health & active operator sessions',
          'Show active suppliers and performance',
        ],
      };
    }
    if (role === 'inventory_manager') {
      return {
        greeting: 'Hello Manager!',
        roleText: 'connected live to your inventory ledger.\n\nI can analyze stock levels, detect low-stock shortages, generate procurement recommendations, look up supplier SLAs, and project demand trajectories.\n\nWhat would you like to explore today?',
        suggestions: [
          'Which items are critically low in stock?',
          'What is our total inventory valuation?',
          'Show active suppliers and lead times',
          'Forecast demand for next 30 days',
        ],
      };
    }
    return {
      greeting: 'Hello Operator!',
      roleText: 'connected live to your warehouse floor terminal.\n\nI can help you look up product bay coordinates, verify barcode SKUs, check pallet quantities, and log receipts.\n\nWhat would you like to check today?',
      suggestions: [
        'Look up storage bay for an SKU',
        'How do I log an inbound delivery?',
        'Check recent dispatch movements',
        'Verify barcode scanner protocol',
      ],
    };
  };

  const initialConfig = getRoleGreeting(userRole);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `${initialConfig.greeting} I am the **StockSense AI Assistant** ${initialConfig.roleText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: initialConfig.suggestions,
    },
  ]);

  useEffect(() => {
    const config = getRoleGreeting(userRole);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [
          {
            id: 'init-1',
            sender: 'assistant',
            text: `${config.greeting} I am the **StockSense AI Assistant** ${config.roleText}`,
            timestamp: prev[0].timestamp,
            suggestions: config.suggestions,
          },
        ];
      }
      return prev;
    });
  }, [userRole]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiChat.sendMessage(messageText);
      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply || 'No information available.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: `Query processing error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1200px] h-[calc(100vh-4.5rem)] mx-auto py-5 px-4 sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Intelligence Hub &amp; AI Copilot
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time inventory knowledge retrieval &amp; semantic reasoning
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
              m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {m.sender === 'user' ? 'You' : 'StockSense Copilot'}
              </span>
              <span className="text-[10px] text-slate-400">{m.timestamp}</span>
            </div>

            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 shadow-xs'
              }`}
            >
              {m.text}
            </div>

            {/* Suggestions Chips */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {m.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 cursor-pointer transition-colors text-left flex items-center gap-1.5 shadow-2xs"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 opacity-60" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="self-start flex items-center gap-2.5 p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-xs shadow-xs">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Analyzing warehouse ledger telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="mt-3.5 flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stock levels, shortages, reorder recommendations, or warehouse status..."
            className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-12 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send Query</span>
        </button>
      </form>
    </div>
  );
};
