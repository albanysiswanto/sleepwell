import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, FileText, Moon, Sparkles, MessageSquare, Activity,
  ChevronRight, AlertCircle, ArrowLeft, Loader2,
  CheckCircle2, AlertTriangle, Info, ShieldAlert, Footprints, Heart,
  TrendingUp, Zap, Clock, Droplet
} from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

const ConsultPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  // Form state
  const [sleepDuration, setSleepDuration] = useState(7.0);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [totalSteps, setTotalSteps] = useState(8000);
  const [veryActiveMinutes, setVeryActiveMinutes] = useState(25);
  const [physicalActivity, setPhysicalActivity] = useState(60);
  const [stressLevel, setStressLevel] = useState(5);
  const [bmiCategory, setBmiCategory] = useState('Normal');
  const [sleepDisorder, setSleepDisorder] = useState('None');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    const payload = {
      sleep_duration: parseFloat(sleepDuration),
      sleep_quality: parseInt(sleepQuality),
      stress_level: parseInt(stressLevel),
      total_steps: parseInt(totalSteps) || 0,
      very_active_minutes: parseInt(veryActiveMinutes) || 0,
      physical_activity: parseInt(physicalActivity) || 0,
      bmi_category: bmiCategory,
      sleep_disorder: sleepDisorder
    };

    try {
      const response = await axios.post(`${API_BASE}/predictions/consult`, payload);
      setResult(response.data.data.prediction);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memproses data Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 65) return 'text-indigo-500';
    if (score >= 45) return 'text-amber-500';
    return 'text-red-500';
  };

  const CircularProgress = ({ score, colorClass }) => {
    const radius = 64;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - ((score || 0) / 100) * circumference;

    return (
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex items-baseline">
          <span className="text-5xl font-extrabold text-white tracking-tighter">{score ?? 0}</span>
          <span className="text-xl font-bold text-slate-500 ml-1">%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Konsultasi Tidur</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
          Isi data tidur dan aktivitas harian Anda untuk mendapatkan prediksi kesehatan tidur esok hari dari AI.
        </p>
      </div>

      {error && (
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form Cards */}
      <form onSubmit={handleSubmit} className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Top Row: 2 cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Card 1: Sleep Core ── */}
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
            <h3 className="text-base font-bold text-slate-200 mb-5 flex items-center gap-2">
              <Moon className="w-5 h-5 text-violet-400 fill-violet-400/20" />
              <span>Sleep Core</span>
            </h3>

            <div className="space-y-6">
              {/* Sleep Duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300" htmlFor="sleep_duration">
                    Durasi Tidur
                  </label>
                  <span className="text-sm font-bold text-violet-400">{sleepDuration}h</span>
                </div>
                <input
                  id="sleep_duration"
                  type="range" min="0" max="14" step="0.5"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                  <span>0h</span><span>14h</span>
                </div>
              </div>

              {/* Sleep Quality — Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300" htmlFor="sleep_quality">
                    Kualitas Tidur
                  </label>
                  <span className="text-sm font-bold text-violet-400">{sleepQuality}</span>
                </div>
                <input
                  id="sleep_quality"
                  type="range" min="1" max="10" step="1"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                  <span>1 (Buruk)</span><span>10 (Sangat Baik)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 2: Aktivitas Harian ── */}
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
            <h3 className="text-base font-bold text-slate-200 mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Aktivitas Harian</span>
            </h3>

            <div className="space-y-4">
              {/* Total Steps */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300" htmlFor="total_steps">
                  Total Langkah
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Footprints className="w-4 h-4" />
                  </span>
                  <input
                    id="total_steps" type="number"
                    value={totalSteps}
                    onChange={(e) => setTotalSteps(e.target.value)}
                    placeholder="e.g. 8500"
                    min="0" max="100000" required
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Very Active Minutes */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300" htmlFor="very_active_minutes">
                  Total Aktivitas Intens
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Activity className="w-4 h-4" />
                  </span>
                  <input
                    id="very_active_minutes" type="number"
                    value={veryActiveMinutes}
                    onChange={(e) => setVeryActiveMinutes(e.target.value)}
                    placeholder="e.g. 45"
                    min="0" max="600"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Physical Activity Total */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300" htmlFor="physical_activity">
                  Total Menit Aktivitas Fisik
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Heart className="w-4 h-4" />
                  </span>
                  <input
                    id="physical_activity" type="number"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value)}
                    placeholder="e.g. 60"
                    min="0" max="1440" required
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 3: Stress & Physiological Context (full width) ── */}
        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
          <h3 className="text-base font-bold text-slate-200 mb-5 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Kondisi & Konteks Fisiologis</span>
          </h3>

          <div className="space-y-6">
            {/* Stress Level — Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300" htmlFor="stress_level">
                  Stress Level
                </label>
                <span className="text-sm font-bold text-violet-400">{stressLevel}</span>
              </div>
              <input
                id="stress_level"
                type="range" min="1" max="10" step="1"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                <span>1 (Tenang)</span><span>10 (Stres)</span>
              </div>
            </div>

            {/* BMI + Disorder row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300" htmlFor="bmi_category">
                  BMI Category
                </label>
                <select
                  id="bmi_category"
                  value={bmiCategory}
                  onChange={(e) => setBmiCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111625] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-300 text-sm outline-none transition-all cursor-pointer"
                >
                  <option value="Normal">Normal</option>
                  <option value="Underweight">Underweight</option>
                  <option value="Overweight">Overweight</option>
                  <option value="Obese">Obese</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300" htmlFor="sleep_disorder">
                  Diagnosed Sleep Disorder
                </label>
                <select
                  id="sleep_disorder"
                  value={sleepDisorder}
                  onChange={(e) => setSleepDisorder(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111625] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-300 text-sm outline-none transition-all cursor-pointer"
                >
                  <option value="None">None</option>
                  <option value="Insomnia">Insomnia</option>
                  <option value="Sleep Apnea">Sleep Apnea</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="px-12 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/25 border border-violet-500/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Prediksi Esok Hari</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* ══════════════════════════════════════════════════ */}
      {/* Result Section — appears below after prediction   */}
      {/* ══════════════════════════════════════════════════ */}
      <div ref={resultRef} className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mt-12"
            >
              {/* Header Title */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Hasil Prediksi Esok Hari</h2>
                <p className="text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed text-sm">
                  {result.summary || "Berdasarkan data tidur dan pola aktivitas Anda hari ini, berikut adalah proyeksi kondisi fisiologis Anda."}
                </p>
              </div>

              {/* 2-Column Grid for Circular Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                
                {/* Fitness Score Card */}
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 relative flex flex-col items-center">
                  <div className="absolute top-6 right-6">
                    <Activity className="w-8 h-8 text-indigo-400/20" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-8">Predicted Fitness</h3>
                  
                  <CircularProgress score={result.fitness_score} colorClass={getScoreColorClass(result.fitness_score)} />
                  
                  <div className="mt-8 px-5 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-2 text-sm font-bold">
                    <TrendingUp className="w-4 h-4" />
                    <span>{result.overall_level || 'High Capacity'}</span>
                  </div>
                </div>

                {/* Wellbeing Index Card */}
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 relative flex flex-col items-center">
                  <div className="absolute top-6 right-6">
                    <Heart className="w-8 h-8 text-violet-400/20" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-8">Predicted Wellbeing</h3>
                  
                  <CircularProgress score={result.wellbeing_index} colorClass={getScoreColorClass(result.wellbeing_index)} />
                  
                  <div className="mt-8 px-5 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full flex items-center gap-2 text-sm font-bold">
                    <Zap className="w-4 h-4" />
                    <span>{result.sleep_risk_label || 'Peak State'}</span>
                  </div>
                </div>

              </div>

              {/* AI Recommendations Card */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 mb-8">
                  <h3 className="text-xl font-bold text-slate-200 mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                    </div>
                    <span>Rekomendasi AI</span>
                  </h3>

                  <div className="space-y-6">
                    {result.recommendations.map((rec, idx) => {
                      // Determine icon based on message content or priority
                      let IconComponent = Info;
                      let iconColor = 'text-slate-400';
                      let bgColor = 'bg-slate-800/50';

                      if (rec.message.toLowerCase().includes('tidur') || rec.message.toLowerCase().includes('sleep')) {
                        IconComponent = Moon;
                        iconColor = 'text-indigo-400';
                        bgColor = 'bg-indigo-500/10';
                      } else if (rec.message.toLowerCase().includes('air') || rec.message.toLowerCase().includes('minum')) {
                        IconComponent = Droplet;
                        iconColor = 'text-blue-400';
                        bgColor = 'bg-blue-500/10';
                      } else if (rec.message.toLowerCase().includes('waktu') || rec.message.toLowerCase().includes('jam')) {
                        IconComponent = Clock;
                        iconColor = 'text-emerald-400';
                        bgColor = 'bg-emerald-500/10';
                      } else if (rec.priority === 'high') {
                        IconComponent = AlertTriangle;
                        iconColor = 'text-red-400';
                        bgColor = 'bg-red-500/10';
                      }

                      return (
                        <div key={idx} className="flex items-center gap-5 p-2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner ${bgColor}`}>
                            <IconComponent className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-400">{rec.message}</p>
                            <p className="text-base font-bold text-slate-200 mt-0.5">{rec.action || 'Perhatikan saran ini'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Centered CTA Button */}
              <div className="flex justify-center mt-10">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/chat?id=${result.id}`}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg shadow-indigo-600/25 border border-indigo-500 flex items-center gap-2.5 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Diskusikan Hasil dengan AI</span>
                  </Link>
                </motion.div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConsultPage;
