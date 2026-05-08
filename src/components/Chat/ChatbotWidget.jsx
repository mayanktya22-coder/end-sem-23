import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

// Access Token (Visible as requested)
const HF_TOKEN = "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";

const ChatbotWidget = ({ issData, newsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'Hello! Ask me anything about the ISS or current news.' }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages.slice(-30)));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const constructContext = () => {
    const issContext = `ISS DATA: Lat ${issData.position?.latitude}, Lon ${issData.position?.longitude}, Speed ${issData.speed.toFixed(0)} km/h, Location ${issData.locationName}.`;
    const newsContext = `NEWS: ${newsData.news.slice(0, 3).map(a => a.title).join(' | ')}.`;
    return `Answer ONLY based on: ${issContext} ${newsContext}. No external knowledge.`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = constructContext();
      const response = await axios.post(
        HF_API_URL,
        { inputs: `<s>[INST] ${context}\n\nUser: ${input} [/INST]` },
        { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
      );
      let aiText = response.data[0]?.generated_text || "Error.";
      if (aiText.includes('[/INST]')) aiText = aiText.split('[/INST]').pop().trim();
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#e54d2e] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-6 w-[320px] h-[450px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-4 bg-[#e54d2e] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <span className="font-bold text-sm">Assistant</span>
              </div>
              <button onClick={() => setMessages([{ role: 'assistant', content: 'Cleared.' }])}>
                <Trash2 size={14} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-[#fdf8f3] dark:bg-slate-950">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl text-xs shadow-sm ${
                    msg.role === 'user' ? 'bg-[#e54d2e] text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-[10px] text-slate-400 animate-pulse">Typing...</div>}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#e54d2e]"
                />
                <button type="submit" className="p-1.5 bg-[#e54d2e] text-white rounded-lg">
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
