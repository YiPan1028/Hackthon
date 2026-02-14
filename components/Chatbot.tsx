
import React, { useState, useRef, useEffect } from 'react';
import { DailyLog, AnalysisResults, ChatMessage } from '../types';
import { getEmotionalInsights } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface ChatbotProps {
  logs: DailyLog[];
  results: AnalysisResults;
}

const Chatbot: React.FC<ChatbotProps> = ({ logs, results }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    const welcome = `Analysis complete. I've examined your data for the last 7 days. Your volatility score is ${results.volatilityScore.toFixed(0)} and your burnout risk is ${results.burnoutLikelihood.toFixed(0)}%. Would you like to know why your stress accumulated or what these patterns mean for your Valentine's plans?`;
    setMessages([{ role: 'model', text: welcome }]);
  }, [results]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getEmotionalInsights(logs, results, userMsg);
    setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't generate a response." }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-rose-500 border-rose-400' : 'bg-stone-800 border-stone-700'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-rose-500" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-rose-600 text-white rounded-tr-none' 
                : 'glass text-stone-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border bg-stone-800 border-stone-700">
              <Bot className="w-4 h-4 text-rose-500" />
            </div>
            <div className="glass text-stone-400 rounded-2xl p-4 rounded-tl-none border border-white/5 flex items-center gap-2 text-sm italic">
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing patterns...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your emotional trends..."
            className="w-full bg-stone-900 border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all disabled:opacity-20 disabled:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-stone-600 mt-4 text-center uppercase tracking-widest font-medium">
          Note: This is an analytical tool, not medical advice.
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
