import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { Send, Bot, User } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AIChat() {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { transactions, goals, debts } = useFinanceStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages([
      { id: '1', sender: 'ai', text: t('aiWelcome') }
    ]);
  }, [lang]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Build context
      const context = {
        name: user?.name,
        transactionsCount: transactions.length,
        totalDebts: debts.reduce((acc, d) => acc + d.remainingAmount, 0),
        goals: goals.map(g => g.name),
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not defined in environment variables.");
      }

      const isEnglish = lang === 'en';
      const systemPrompt = `You are FinSim AI, an expert Financial Advisor. 
      You help users understand their personal finances.
      Use this context to give personalized advice:
      ${JSON.stringify(context, null, 2)}
      
      Keep answers concise, professional, and practical.
      IMPORTANT: You MUST reply in the language the user preferred. The user's preferred language is ${isEnglish ? 'English' : 'Spanish'}. Write all your advice and answers in ${isEnglish ? 'English' : 'Spanish'}.`;

      // Call Gemini API directly via fetch to avoid importing bulky Node-targeted SDKs in the browser,
      // which can cause React version/hook conflicts.
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMsg
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la API de Groq: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.choices[0].message.content || '';
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: aiText }]);
    } catch (err: any) {
      console.error("Gemini frontend error:", err);
      const errorMessage = err?.message?.includes("VITE_GEMINI_API_KEY")
        ? (lang === 'es' ? "Error: VITE_GEMINI_API_KEY no está configurada en las variables de entorno de Vercel/Local." : "Error: VITE_GEMINI_API_KEY is not configured in the Vercel/Local environment variables.")
        : t('aiError');
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-900 border-b border-gray-200 flex items-center space-x-3 text-white">
        <div className="p-2 bg-green-500 rounded-xl">
          <Bot className="w-5 h-5 text-gray-900" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{t('geminiAdvisor')}</h2>
          <p className="text-xs text-green-400 font-medium tracking-wider uppercase">{t('online')}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-gray-200 ml-2' : 'bg-gray-900 mr-2'}`}>
                {msg.sender === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-green-500" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm font-serif italic'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex flex-row items-end">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 mr-2">
                <Bot className="w-5 h-5 text-green-500" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100 rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('aiInputPlaceholder')}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
