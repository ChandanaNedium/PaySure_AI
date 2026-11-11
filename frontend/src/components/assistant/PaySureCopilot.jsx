import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useDemo } from '../../context/DemoContext';

export default function PaySureCopilot() {
  const { activeScenario } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **PaySure AI Assistant**, your payment intelligence copilot. Ask me anything about payment failures, whether money was deducted, or whether it is safe to retry a transaction.",
      suggested_actions: ["Why did my payment fail?", "Has my money been deducted?", "Is it safe to retry?"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', {
        role: 'user',
        content: textToSend,
        transaction_context: activeScenario?.transaction_ref || null
      });

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.data.reply,
          suggested_actions: res.data.suggested_actions || []
        }
      ]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I'm temporarily experiencing connectivity issues with the AI endpoint. However, rest assured that PaySure's deterministic rule engine is actively safeguarding all transactions.",
          suggested_actions: ["Analyze Transaction in SURE Engine"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-brand-navy via-slate-900 to-brand-paypal text-white font-bold text-xs shadow-xl shadow-brand-navy/30 border border-brand-paypal/30 hover:scale-105 transition-all"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-brand-cyan" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-cyan animate-ping" />
        </div>
        <span className="hidden sm:inline">PaySure Assistant</span>
      </button>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-fadeIn">
          {/* Header */}
          <div className="px-5 py-3.5 bg-brand-navy text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">PaySure Assistant</h4>
                <p className="text-[10px] text-brand-cyan">
                  {activeScenario ? `Active Context: ${activeScenario.transaction_ref}` : 'Payment Intelligence Copilot'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-blue-100 text-brand-paypal flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3.5 max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-navy text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {m.content}

                  {/* Suggested Action Chips */}
                  {m.suggested_actions && m.suggested_actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                      {m.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(act)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-[10px] font-semibold text-brand-paypal transition"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <Bot className="w-4 h-4 animate-spin text-brand-paypal" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. Has my money been deducted?..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-paypal"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-8 w-8 rounded-xl bg-brand-navy hover:bg-slate-800 text-white flex items-center justify-center transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
