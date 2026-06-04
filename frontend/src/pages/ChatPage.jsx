import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  Send, Brain, User, Sparkles, AlertCircle, BookOpen,
  ArrowLeft, Plus, MessageSquare, ShieldCheck, Loader2, Lightbulb
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { findLocalAnswer, QUICK_SUGGESTIONS } from '../utils/sleepwellKnowledge';

const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const predictionId = searchParams.get('id');

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [tokensLeft, setTokensLeft] = useState(5);
  const [userContext, setUserContext] = useState('');
  const [pastPredictions, setPastPredictions] = useState([]);
  
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
    
    const fetchPredictions = async () => {
      try {
        const response = await axios.get(`${API_BASE}/predictions?limit=10`);
        setPastPredictions(response.data.data.predictions || []);
      } catch (err) {
        console.error('Gagal mengambil riwayat prediksi:', err);
      }
    };

    fetchTokens();
    fetchPredictions();
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
          let contextRecs = '';
          if (pred.recommendations && pred.recommendations.length > 0) {
            recListText = '\n\nBerdasarkan data Anda, berikut **rekomendasi tidur berbasis sains**:\n';
            pred.recommendations.forEach((r) => {
              const iconMap = { high: '🔴', medium: '🟡', low: '🟢', ml: '🤖' };
              const icon = iconMap[r.priority] || '💡';
              recListText += `\n${icon} **${r.message}**${r.action ? `\n    💡 _Tips: ${r.action}_` : ''}`;
            });
            contextRecs = pred.recommendations.map(r => r.message).join(' | ');
          }

          const userProfileText = user ? `Nama: ${user.name}, Umur: ${user.age || 'tidak diketahui'} tahun, Berat Badan: ${user.weight || 'tidak diketahui'} kg, Pekerjaan: ${user.occupation || 'tidak diketahui'}.` : 'Data profil tidak tersedia.';

          setUserContext(
            `[SISTEM INFO: Profil Pengguna: ${userProfileText} Kondisi saat ini: Fitness Score: ${pred.fitness_score}/100, Wellbeing Index: ${pred.wellbeing_index}/100. Rekomendasi ML: ${contextRecs}. Jawab pertanyaan dengan ramah, gunakan bahasa Indonesia, panggil nama pengguna jika relevan, dan sesuaikan saran berdasarkan usia, berat badan, atau pekerjaannya.]`
          );

          welcomeContent = `Halo${user ? ' ' + user.name.split(' ')[0] : ''}! 👋 Berdasarkan hasil konsultasi terakhir Anda:\n\n🏋️ **Fitness Score** esok hari: **${pred.fitness_score ?? '—'}**\n🧘 **Wellbeing Index** esok hari: **${pred.wellbeing_index ?? '—'}**${recListText}\n\nAnda bisa bertanya tentang arti skor ini, tips perbaikan, atau topik tidur lainnya!`;
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
      const res = await axios.post(`${API_BASE}/chat/token/decrement`);
      setTokensLeft(res.data.data.tokensLeft);
    } catch (err) {
      console.error('Gagal mengurangi token:', err);
      setSending(false);
      return;
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: text
    }]);

    const localResult = findLocalAnswer(text);

    if (localResult.matched) {
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

    setTyping(true);

    try {
      const promptPayload = userContext 
        ? `${userContext}\n\nPertanyaan pengguna: ${text}` 
        : text;

      const response = await axios.post(`${API_BASE}/predictions/tips`, { prompt: promptPayload });
      
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

  const handleSuggestionClick = (suggestion) => {
    handleSend(null, suggestion);
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  const renderMessageContent = (msg) => {
    let html = msg.content;
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-on-surface font-bold">$1</strong>');
    html = html.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em class="text-on-surface-variant italic">$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant text-[13px] font-mono">$1</code>');
    html = html.replace(/^[•\-] (.+)$/gm, '<span class="flex items-start gap-2"><span class="text-primary mt-0.5">•</span><span>$1</span></span>');
    html = html.replace(/^\|(.+)\|$/gm, (match, inner) => {
      const cells = inner.split('|').map(c => c.trim());
      const row = cells.map(c => `<td class="px-2 py-1 border-b border-outline-variant text-[13px]">$1</td>`).join('');
      return `<tr>${row}</tr>`;
    });
    html = html.replace(/((<tr>.*?<\/tr>\n?)+)/g, '<div class="overflow-x-auto my-2"><table class="w-full text-left border-collapse">$1</table></div>');
    html = html.replace(/\n/g, '<br/>');

    return (
      <div>
        {msg.source === 'knowledge_base' && msg.title && (
          <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-outline-variant/50">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="label-sm text-primary uppercase tracking-wider">{msg.title}</span>
          </div>
        )}
        {msg.source === 'groq_llm' && (
          <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-outline-variant/50">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="label-sm text-primary uppercase tracking-wider">SleepWell AI</span>
          </div>
        )}
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar menu inside chat */}
        <aside className="hidden md:flex flex-col gap-1 w-[260px] bg-surface-container-low border-r border-outline-variant p-4 h-full">
          <Link
            to="/consult"
            className="btn-primary w-full justify-center mb-4"
          >
            <Plus className="w-4 h-4 stroke-[2px]" />
            <span>Konsultasi Baru</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-[15px] font-semibold"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2px]" />
            <span>Ke Dashboard</span>
          </Link>

          {/* Context Selector */}
          {pastPredictions.length > 0 && (
            <div className="mt-6 mb-2">
              <p className="label-sm text-on-surface-variant px-4 mb-2 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" /> Konteks Data
              </p>
              <div className="px-4">
                <select 
                  className="input-field py-2 text-[13px] bg-surface"
                  value={predictionId || ''}
                  onChange={(e) => {
                    const params = new URLSearchParams();
                    if (e.target.value) params.append('id', e.target.value);
                    window.location.search = params.toString(); // force reload to reset chat state easily
                  }}
                >
                  <option value="">Pilih Riwayat Prediksi...</option>
                  {pastPredictions.map(p => (
                    <option key={p.id} value={p.id}>
                      {new Date(p.predicted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - Skor: {p.fitness_score}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Knowledge Topics mini-nav */}
          <div className="mt-4">
            <p className="label-sm text-on-surface-variant px-4 mb-2">Topik Populer</p>
            {['Apa itu fitness score?', 'Apa itu wellbeing index?', 'Model ML apa yang dipakai?', 'Seberapa akurat prediksinya?'].map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(topic)}
                disabled={sending}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-all cursor-pointer disabled:opacity-40"
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 bg-surface-container border border-outline-variant rounded-md">
            <p className="label-sm text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 stroke-[2px]" />
              <span>Chatbot Cerdas</span>
            </p>
            <p className="text-on-surface-variant text-[11px] mt-1.5 leading-relaxed font-semibold">
              Pertanyaan domain dijawab lokal. Pertanyaan umum diteruskan ke SleepWell AI.
            </p>
          </div>
        </aside>

        {/* Chat Interface Panel */}
        <main className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
          
          {/* Mobile subheader bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
            <Link to="/dashboard" className="text-[13px] font-semibold text-on-surface-variant flex items-center gap-1">
              <ArrowLeft className="w-4 h-4 stroke-[2px]" />
              <span>Dashboard</span>
            </Link>
            <span className="text-[13px] font-bold text-on-surface">Asisten SleepWell AI</span>
            <Link to="/consult" className="text-[13px] font-semibold text-primary flex items-center gap-0.5">
              <Plus className="w-4 h-4 stroke-[2px]" />
              <span>Baru</span>
            </Link>
          </div>

          {/* Messages Feed View */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' 
                      ? 'bg-primary-container text-on-primary-container' 
                      : 'bg-surface-container border border-outline-variant text-primary'
                  }`}>
                    {m.role === 'user' ? <User className="w-4 h-4 stroke-[2px]" /> : <Brain className="w-4 h-4 stroke-[2px]" />}
                  </div>

                  {/* Message Bubble Body */}
                  <div className={`p-4 rounded-md text-[15px] leading-relaxed border max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-primary text-on-primary border-primary rounded-tr-none'
                      : 'bg-surface-container-low border-outline-variant text-on-surface rounded-tl-none'
                  }`}>
                    {renderMessageContent(m)}
                  </div>
                </div>
              ))}

              {/* Quick Suggestion Chips */}
              {showSuggestions && messages.length === 1 && (
                <div className="flex flex-col items-start gap-3 pl-13">
                  <div className="flex items-center gap-1.5 text-on-surface-variant ml-13">
                    <Lightbulb className="w-4 h-4 stroke-[2px]" />
                    <span className="label-sm">Pertanyaan Populer</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-13">
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={sending}
                        className="btn-secondary py-1.5 px-3 text-[13px]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing bubble */}
              {typing && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-md bg-surface-container border border-outline-variant text-primary flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 stroke-[2px]" />
                  </div>
                  <div className="px-4 py-3 bg-surface-container-low border border-outline-variant text-on-surface-variant text-[13px] font-semibold rounded-md rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary stroke-[2px]" />
                    <span>AI sedang menyusun jawaban...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Chat Box */}
          <div className="p-4 bg-surface-container-low border-t border-outline-variant">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSend} className="flex gap-2 items-end bg-surface border border-outline-variant focus-within:border-primary rounded-md p-2 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  disabled={tokensLeft <= 0}
                  placeholder={tokensLeft > 0 ? "Ketik pesan Anda..." : "Token habis. Sesi konsultasi selesai."}
                  rows="1"
                  className="flex-1 bg-transparent border-none text-on-surface placeholder-on-surface-variant text-[15px] outline-none resize-none py-2 px-3 focus:ring-0 leading-relaxed max-h-[140px] disabled:opacity-50"
                  style={{ height: 'auto' }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending || tokensLeft <= 0}
                  className="w-10 h-10 rounded-md bg-primary hover:bg-primary-container hover:text-on-primary-container text-on-primary flex items-center justify-center cursor-pointer transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 stroke-[2px]" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-2.5 max-w-lg mx-auto">
                <p className="text-left text-[11px] font-semibold text-on-surface-variant leading-normal max-w-[80%] uppercase">
                  AI dapat membuat kesalahan. Periksa informasi penting.
                </p>
                <div className={`badge ${tokensLeft > 0 ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
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
