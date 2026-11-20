import React, { useState } from 'react';
import { Bot, Send, Sparkles, Building, IndianRupee, Users, AlertTriangle, Wrench, Calendar, X } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  sender: 'user' | 'copilot';
  text: string;
  toolInvoked?: string;
  data?: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerCopilotDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'copilot',
      text: 'Hello! I am your RentEase Owner Copilot. I analyze your authorized portfolio records to provide real-time operational insights. How may I assist you today?',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const quickPrompts = [
    { label: 'Show vacant properties', icon: <Building className="w-3.5 h-3.5" /> },
    { label: 'How much rent did I collect this month?', icon: <IndianRupee className="w-3.5 h-3.5" /> },
    { label: 'Which applications are pending?', icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Which tenants have overdue payments?', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { label: 'Which properties need maintenance?', icon: <Wrench className="w-3.5 h-3.5" /> },
    { label: 'Which rental agreements expire soon?', icon: <Calendar className="w-3.5 h-3.5" /> },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.queryOwnerCopilot(textToSend);
      if (res.success) {
        const copilotMsg: Message = {
          sender: 'copilot',
          text: res.reply,
          toolInvoked: res.toolInvoked,
          data: res.data,
        };
        setMessages((prev) => [...prev, copilotMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'copilot', text: res.message || 'Error executing authorized query.' },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'copilot', text: 'An unexpected connection error occurred.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 text-blue-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-base">RentEase Owner Copilot</h3>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-xs text-slate-300">Authorized Real-Time Portfolio Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tools Tray */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 overflow-x-auto flex space-x-2 no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.label)}
              className="flex items-center space-x-1.5 text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm transition flex-shrink-0"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                }`}
              >
                {msg.toolInvoked && (
                  <div className="mb-2 inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100/80 text-blue-800 border border-blue-200">
                    <span>⚡ Tool: {msg.toolInvoked}()</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic p-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
              <span>Analyzing authorized database records...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your properties, rent, leases..."
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
