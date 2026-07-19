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

    // Build context with robust safety fallbacks to prevent undefined values
    const safeName = user?.name || 'Usuario';
    const safeTransactionsCount = Number(transactions?.length || 0);
    const safeTotalDebts = Number(debts?.reduce((acc, d) => acc + (d?.remainingAmount || 0), 0) || 0);
    const safeGoals = Array.isArray(goals) ? goals.map(g => g?.name || 'Meta sin nombre') : [];

    const context = {
      name: safeName,
      transactionsCount: safeTransactionsCount,
      totalDebts: safeTotalDebts,
      goals: safeGoals,
    };

    const isEnglish = lang === 'en';
    const systemPrompt = `You are FinSim AI, an expert Financial Advisor. 
    You help users understand their personal finances.
    Use this context to give personalized advice:
    Name: ${context.name}
    Transactions Count: ${context.transactionsCount}
    Total Debts: ${context.totalDebts}
    Financial Goals: ${context.goals.join(', ') || 'Ninguno'}
    
    Keep answers concise, professional, and practical.
    IMPORTANT: You MUST reply in the language the user preferred. The user's preferred language is ${isEnglish ? 'English' : 'Spanish'}. Write all your advice and answers in ${isEnglish ? 'English' : 'Spanish'}.`;

    try {
      let aiText = '';
      let success = false;

      // 1. Primary Attempt: Use Groq API with the provided testing key
      try {
        const groqApiKey = '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';
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
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

        if (response.ok) {
          const data = await response.json();
          aiText = data.choices?.[0]?.message?.content || '';
          if (aiText) {
            success = true;
          }
        } else {
          console.warn(`Groq API returned status: ${response.status}`);
        }
      } catch (groqErr) {
        console.error("Groq API failed, trying fallback...", groqErr);
      }

      // 2. Secondary Attempt: Fallback to Gemini 1.5 Flash if Groq failed and Gemini API Key is available
      if (!success) {
        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (geminiApiKey) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: userMsg
                      }
                    ]
                  }
                ],
                systemInstruction: {
                  parts: [
                    {
                      text: systemPrompt
                    }
                  ]
                }
              })
            });

            if (response.ok) {
              const data = await response.json();
              aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (aiText) {
                success = true;
              }
            }
          } catch (geminiErr) {
            console.error("Gemini fallback also failed:", geminiErr);
          }
        }
      }

      // If both methods failed, throw an error
      if (!success) {
        throw new Error("Could not connect to any AI provider.");
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: aiText }]);
    } catch (err: any) {
      console.error("All AI providers failed:", err);
      const errorMessage = lang === 'es' 
        ? "Lo siento, ha ocurrido un problema al conectar con el asistente de IA. Por favor, inténtalo de nuevo en unos momentos."
        : "Sorry, there was a problem connecting to the AI assistant. Please try again in a moment.";
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
