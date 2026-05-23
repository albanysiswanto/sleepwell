import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Brain, User, Sparkles, AlertCircle, BookOpen,
  ArrowLeft, Plus, MessageSquare, ShieldCheck, Loader2, Lightbulb
} from 'lucide-react';
import { API_BASE } from '../context/AuthContext';
import { findLocalAnswer, QUICK_SUGGESTIONS } from '../utils/sleepwellKnowledge';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const predictionId = searchParams.get('id');

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [tokensLeft, setTokensLeft] = useState(5);
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Fetch initial token count from backend
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await axios.get(`${API_BASE}/chat/token`);
        setTokensLeft(response.data.data.tokensLeft);
      } catch (err) {
        console.error('Gagal mengambil sisa token:', err);
      }
    };
    fetchTokens();
  }, []);

  // Show notification when token runs out
  useEffect(() => {
    if (tokensLeft === 0) {
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].id === 'token-limit') return prev;
        return [...prev, {
          id: 'token-limit',
          role: 'ai',
          content: '⚠️ **Batas Percakapan Harian Tercapai**\n\nAnda telah menggunakan semua 5 token untuk hari ini. Sesi chat dikunci. Silakan kembali besok untuk melanjutkan konsultasi dengan SleepWell AI!',
          source: 'system'
        }];
      });
    }
  }, [tokensLeft]);

  // Load initial welcome message and fetch prediction details if param ID exists
  useEffect(() => {
    const loadInitialContext = async () => {
      setMessages([]);
      
      let welcomeContent = 'Halo! 👋 Saya adalah **Asisten Kesehatan SleepWell AI**.\n\nSaya bisa membantu Anda memahami:\n• **Fitness Score** & **Wellbeing Index** — apa itu dan cara membacanya\n• **Model Machine Learning** — bagaimana prediksi bekerja\n• **Tips tidur** — saran personal berbasis sains\n• **Fitur aplikasi** — cara menggunakan SleepWell\n\nSilakan tanya apa saja, atau pilih salah satu topik di bawah! 👇';
      
      if (predictionId) {
        setTyping(true);
        try {
          const response = await axios.get(`${API_BASE}/predictions/${predictionId}`);
          const pred = response.data.data.prediction;
          
          let recListText = '';
          if (pred.recommendations && pred.recommendations.length > 0) {
            recListText = '\n\nBerdasarkan data Anda, berikut **rekomendasi tidur berbasis sains**:\n';
            pred.recommendations.forEach((r) => {
              const iconMap = { high: '🔴', medium: '🟡', low: '🟢', ml: '🤖' };
              const icon = iconMap[r.priority] || '💡';
              recListText += `\n${icon} **${r.message}**${r.action ? `\n    💡 _Tips: ${r.action}_` : ''}`;
            });
          }

          welcomeContent = `Halo! 👋 Berdasarkan hasil konsultasi terakhir Anda:\n\n🏋️ **Fitness Score** esok hari: **${pred.fitness_score ?? '—'}**\n🧘 **Wellbeing Index** esok hari: **${pred.wellbeing_index ?? '—'}**${recListText}\n\nAnda bisa bertanya tentang arti skor ini, tips perbaikan, atau topik tidur lainnya!`;
        } catch (err) {
          console.error('Gagal memuat rekomendasi:', err);
        } finally {
          setTyping(false);
        }
      }

      setMessages([{
        id: 'welcome',
        role: 'ai',
        content: welcomeContent,
        source: 'system'
      }]);
    };

    loadInitialContext();
  }, [predictionId]);

  // Handle sending messages — with local knowledge check first
  const handleSend = async (e, overrideText) => {
    if (e) e.preventDefault();
    const text = (overrideText || inputText).trim();
    if (!text || sending || tokensLeft <= 0) return;

    setInputText('');
    setSending(true);
    setShowSuggestions(false);
    
    try {
      // Kurangi token di backend
      const res = await axios.post(`${API_BASE}/chat/token/decrement`);
      setTokensLeft(res.data.data.tokensLeft);
    } catch (err) {
      console.error('Gagal mengurangi token:', err);
      setSending(false);
      return;
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 1. Add user message
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: text
    }]);

    // 2. Check local knowledge base FIRST
    const localResult = findLocalAnswer(text);

    if (localResult.matched) {
      // Small delay for natural feel
      setTyping(true);
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
      setTyping(false);

      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-kb',
        role: 'ai',
        content: localResult.answer,
        source: 'knowledge_base',
        title: localResult.title
      }]);

      setSending(false);
      return;
    }

    // 3. If no local match, send to Groq LLM via backend /tips endpoint
    setTyping(true);

    try {
      const response = await axios.post(`${API_BASE}/predictions/tips`, { prompt: text });
      
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'ai',
        content: response.data.data.tip || 'Maaf, saya tidak bisa merespon pertanyaan tersebut saat ini.',
        source: 'groq_llm'
      }]);
    } catch (err) {
      console.error('Gagal mengirim chat:', err);
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'ai',
        content: '❌ **Gagal terhubung ke server AI.** Pastikan backend Express dan server FastAPI sudah berjalan.\n\n💡 Coba tanyakan tentang topik SleepWell (mis: "apa itu fitness score") yang bisa saya jawab secara lokal!',
        source: 'error'
      }]);
    } finally {
      setTyping(false);
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle suggestion chip click
  const handleSuggestionClick = (suggestion) => {
    handleSend(null, suggestion);
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  // Render message content with markdown-like formatting
  const renderMessageContent = (msg) => {
    let html = msg.content;
    
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-300 font-bold">$1</strong>');
    // Italic: _text_
    html = html.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em class="text-slate-400 italic">$1</em>');
    // Inline code: `text`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-white/5 px-1.5 py-0.5 rounded text-violet-300 text-xs font-mono">$1</code>');
    // Bullet points: • or - at start of line
    html = html.replace(/^[•\-] (.+)$/gm, '<span class="flex items-start gap-2"><span class="text-violet-400 mt-0.5">•</span><span>$1</span></span>');
    // Table rows (simple): | a | b | c |
    html = html.replace(/^\|(.+)\|$/gm, (match, inner) => {
      const cells = inner.split('|').map(c => c.trim());
      const row = cells.map(c => `<td class="px-2 py-1 border-b border-white/5 text-xs">${c}</td>`).join('');
      return `<tr>${row}</tr>`;
    });
    // Wrap consecutive table rows in a table
    html = html.replace(/((<tr>.*?<\/tr>\n?)+)/g, '<div class="overflow-x-auto my-2"><table class="w-full text-left border-collapse">$1</table></div>');
    // Newlines
    html = html.replace(/\n/g, '<br/>');

    return (
      <div>
        {/* Source badge for knowledge base answers */}
        {msg.source === 'knowledge_base' && msg.title && (
          <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/5">
            <BookOpen className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">{msg.title}</span>
          </div>
        )}
        {msg.source === 'groq_llm' && (
          <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Groq AI (Llama 3.3 70B)</span>
          </div>
        )}
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar menu inside chat */}
        <aside className="hidden md:flex flex-col gap-1 w-[260px] bg-white/[0.01] border-r border-white/5 p-4 h-full">
          <Link
            to="/consult"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600/10 to-blue-500/10 border border-violet-500/20 hover:border-violet-500/40 rounded-2xl text-violet-300 font-bold transition-all text-sm mb-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Konsultasi Baru</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Dashboard</span>
          </Link>

          {/* Knowledge Topics mini-nav */}
          <div className="mt-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Topik Populer</p>
            {['Apa itu fitness score?', 'Apa itu wellbeing index?', 'Model ML apa yang dipakai?', 'Seberapa akurat prediksinya?'].map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(topic)}
                disabled={sending}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-violet-300 hover:bg-violet-500/5 rounded-xl transition-all cursor-pointer disabled:opacity-40"
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Chatbot Cerdas</span>
            </p>
            <p className="text-slate-500 text-[10px] mt-1.5 leading-relaxed">
              Pertanyaan domain dijawab lokal. Pertanyaan umum diteruskan ke Groq AI.
            </p>
          </div>
        </aside>

        {/* Chat Interface Panel */}
        <main className="flex-1 flex flex-col h-full bg-[#0a0e1a]/20 overflow-hidden">
          
          {/* Mobile subheader bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0e1a]/60">
            <Link to="/dashboard" className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Dashboard</span>
            </Link>
            <span className="text-xs font-extrabold text-slate-200">Asisten SleepWell AI</span>
            <Link to="/consult" className="text-xs font-semibold text-violet-400 flex items-center gap-0.5">
              <Plus className="w-3 h-3" />
              <span>Baru</span>
            </Link>
          </div>

          {/* Messages Feed View */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                    m.role === 'user' 
                      ? 'bg-blue-600/20 border border-blue-500/20 text-blue-400' 
                      : 'bg-violet-600/20 border border-violet-500/20 text-violet-400'
                  }`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Body */}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-blue-600/10 border-blue-500/20 text-slate-200 rounded-tr-none'
                      : 'bg-white/[0.03] border-white/5 text-slate-300 rounded-tl-none'
                  }`}>
                    {renderMessageContent(m)}
                  </div>
                </motion.div>
              ))}

              {/* Quick Suggestion Chips — shown after welcome */}
              {showSuggestions && messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-start gap-3 pl-13"
                >
                  <div className="flex items-center gap-1.5 text-slate-500 ml-13">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pertanyaan Populer</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-13">
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={sending}
                        className="px-3.5 py-2 bg-violet-500/5 hover:bg-violet-500/15 border border-violet-500/15 hover:border-violet-500/30 text-violet-300 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Typing bubble */}
              {typing && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 bg-white/[0.03] border border-white/5 text-slate-500 text-xs font-semibold rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                    <span>AI sedang menyusun jawaban...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Chat Box wrapper */}
          <div className="p-4 bg-gradient-to-t from-[#0a0e1a] to-transparent border-t border-white/5">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSend} className="flex gap-2 items-end bg-white/[0.02] border border-white/5 focus-within:border-violet-500/30 rounded-3xl p-2.5 transition-all shadow-xl shadow-black/20">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  disabled={tokensLeft <= 0}
                  placeholder={tokensLeft > 0 ? "Tanyakan tentang fitness score, wellbeing, model AI, tips tidur..." : "Token habis. Sesi konsultasi selesai."}
                  rows="1"
                  className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-500 text-sm outline-none resize-none py-2 px-3 focus:ring-0 leading-relaxed max-h-[140px] disabled:opacity-50"
                  style={{ height: 'auto' }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputText.trim() || sending || tokensLeft <= 0}
                  className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center cursor-pointer transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
              <div className="flex items-center justify-between mt-2.5 max-w-lg mx-auto">
                <p className="text-left text-[10px] text-slate-600 leading-normal max-w-[80%]">
                  Pertanyaan tentang SleepWell dijawab dari knowledge base lokal · Pertanyaan umum diteruskan ke Groq AI
                </p>
                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tokensLeft > 0 ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {tokensLeft}/5 Token
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ChatPage;
