import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  Brain, Moon, Sparkles, MessageSquare, Activity,
  AlertCircle, ArrowLeft, Loader2,
  AlertTriangle, Info, ShieldAlert, Footprints, Heart,
  TrendingUp, Zap, Clock, Droplet, History
} from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

const ConsultPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(() => {
    const saved = sessionStorage.getItem('sleepwell_consult_result');
    return saved ? JSON.parse(saved) : null;
  });
  const resultRef = useRef(null);

  // Form state
  const [savedInputs] = useState(() => JSON.parse(sessionStorage.getItem('sleepwell_consult_inputs') || '{}'));
  const [sleepDuration, setSleepDuration] = useState(savedInputs.sleepDuration ?? 7.0);
  const [sleepQuality, setSleepQuality] = useState(savedInputs.sleepQuality ?? 7);
  const [totalSteps, setTotalSteps] = useState(savedInputs.totalSteps ?? 8000);
  const [veryActiveMinutes, setVeryActiveMinutes] = useState(savedInputs.veryActiveMinutes ?? 25);
  const [physicalActivity, setPhysicalActivity] = useState(savedInputs.physicalActivity ?? 60);
  const [stressLevel, setStressLevel] = useState(savedInputs.stressLevel ?? 5);
  const [bmiCategory, setBmiCategory] = useState(savedInputs.bmiCategory ?? 'Normal');
  const [sleepDisorder, setSleepDisorder] = useState(savedInputs.sleepDisorder ?? 'None');

  const [logs, setLogs] = useState([]);
  const [selectedLogId, setSelectedLogId] = useState('manual');
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/sleep-logs?limit=10`);
        setLogs(res.data.data.sleep_logs || []);
      } catch (err) {
        console.error("Gagal mengambil histori log:", err);
      }
    };
    fetchLogs();
  }, []);

  const handleLogSelect = (e) => {
    const logId = e.target.value;
    setSelectedLogId(logId);
    
    if (logId === 'manual') return;
    
    const log = logs.find(l => l.id === logId);
    if (log) {
      setSleepDuration(log.sleep_duration);
      setSleepQuality(log.sleep_quality);
      setTotalSteps(log.total_steps || 0);
      setVeryActiveMinutes(log.very_active_minutes || 0);
      setPhysicalActivity(log.physical_activity || 0);
      setStressLevel(log.stress_level);
      setBmiCategory(log.bmi_category || 'Normal');
      setSleepDisorder(log.sleep_disorder || 'None');
    }
  };

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
      const predictionData = response.data.data.prediction;
      setResult(predictionData);
      
      sessionStorage.setItem('sleepwell_consult_result', JSON.stringify(predictionData));
      sessionStorage.setItem('sleepwell_consult_inputs', JSON.stringify({
        sleepDuration, sleepQuality, totalSteps, veryActiveMinutes, physicalActivity, stressLevel, bmiCategory, sleepDisorder
      }));

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
    if (score >= 65) return 'text-primary';
    if (score >= 45) return 'text-on-surface-variant';
    return 'text-error';
  };

  const CircularProgress = ({ score, colorClass }) => {
    const radius = 72;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - ((score || 0) / 100) * circumference;

    return (
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            className="text-surface-container"
            stroke="currentColor"
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tighter">{score ?? 0}</span>
            <span className="text-sm sm:text-base font-bold text-on-surface-variant ml-0.5">%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      {/* Header */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2px]" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <h1 className="text-[32px] font-bold text-on-surface">Konsultasi Tidur</h1>
        <p className="text-on-surface-variant text-[15px] mt-2 max-w-lg mx-auto">
          Isi data tidur dan aktivitas harian Anda untuk mendapatkan prediksi kesehatan tidur esok hari dari AI.
        </p>
      </div>

      {error && (
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 rounded-md bg-error-container border border-error-container text-on-error-container text-[15px] flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 stroke-[2px]" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form Cards */}
      <form onSubmit={handleSubmit} className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Data Source Selector
        <div className="card border-primary/30">
          <h3 className="text-[17px] font-bold text-on-surface mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary stroke-[2px]" />
            <span>Sumber Data Konsultasi</span>
          </h3>
          <div className="space-y-1.5">
            <label className="label-sm text-on-surface-variant" htmlFor="log_selector">
              Pilih Data (Opsional)
            </label>
            <select 
              id="log_selector"
              value={selectedLogId} 
              onChange={handleLogSelect}
              className="input-field"
            >
              <option value="manual">Isi Data Baru Secara Manual</option>
              {logs.map(log => (
                <option key={log.id} value={log.id}>
                  Histori: {new Date(log.log_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
        </div> */}

        {/* Top Row: 2 cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Card 1: Sleep Core ── */}
          <div className="card">
            <h3 className="text-[17px] font-bold text-on-surface mb-5 flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary stroke-[2px]" />
              <span>Sleep Core</span>
            </h3>

            <div className="space-y-6">
              {/* Sleep Duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label-sm text-on-surface-variant" htmlFor="sleep_duration">
                    Durasi Tidur
                  </label>
                  <span className="text-[15px] font-bold text-primary">{sleepDuration}h</span>
                </div>
                <input
                  id="sleep_duration"
                  type="range" min="0" max="14" step="0.5"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[11px] text-on-surface-variant font-semibold uppercase">
                  <span>0h</span><span>14h</span>
                </div>
              </div>

              {/* Sleep Quality — Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label-sm text-on-surface-variant" htmlFor="sleep_quality">
                    Kualitas Tidur
                  </label>
                  <span className="text-[15px] font-bold text-primary">{sleepQuality}</span>
                </div>
                <input
                  id="sleep_quality"
                  type="range" min="1" max="10" step="1"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[11px] text-on-surface-variant font-semibold uppercase">
                  <span>1 (Buruk)</span><span>10 (Baik)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 2: Aktivitas Harian ── */}
          <div className="card">
            <h3 className="text-[17px] font-bold text-on-surface mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary stroke-[2px]" />
              <span>Aktivitas Harian</span>
            </h3>

            <div className="space-y-4">
              {/* Total Steps */}
              <div className="space-y-1.5">
                <label className="label-sm text-on-surface-variant" htmlFor="total_steps">
                  Total Langkah
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant">
                    <Footprints className="w-5 h-5 stroke-[2px]" />
                  </span>
                  <input
                    id="total_steps" type="number"
                    value={totalSteps}
                    onChange={(e) => setTotalSteps(e.target.value)}
                    placeholder="e.g. 8500"
                    min="0" max="100000" required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Very Active Minutes */}
              <div className="space-y-1.5">
                <label className="label-sm text-on-surface-variant" htmlFor="very_active_minutes">
                  Aktivitas Intens (Menit)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant">
                    <Activity className="w-5 h-5 stroke-[2px]" />
                  </span>
                  <input
                    id="very_active_minutes" type="number"
                    value={veryActiveMinutes}
                    onChange={(e) => setVeryActiveMinutes(e.target.value)}
                    placeholder="e.g. 45"
                    min="0" max="600"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Physical Activity Total */}
              <div className="space-y-1.5">
                <label className="label-sm text-on-surface-variant" htmlFor="physical_activity">
                  Aktivitas Fisik Total (Menit)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant">
                    <Heart className="w-5 h-5 stroke-[2px]" />
                  </span>
                  <input
                    id="physical_activity" type="number"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value)}
                    placeholder="e.g. 60"
                    min="0" max="1440" required
                    className="input-field pl-11"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 3: Stress & Physiological Context (full width) ── */}
        <div className="card">
          <h3 className="text-[17px] font-bold text-on-surface mb-5 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-secondary stroke-[2px]" />
            <span>Kondisi & Konteks Fisiologis</span>
          </h3>

          <div className="space-y-6">
            {/* Stress Level — Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label-sm text-on-surface-variant" htmlFor="stress_level">
                  Stress Level
                </label>
                <span className="text-[15px] font-bold text-primary">{stressLevel}</span>
              </div>
              <input
                id="stress_level"
                type="range" min="1" max="10" step="1"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-on-surface-variant font-semibold uppercase">
                <span>1 (Tenang)</span><span>10 (Stres)</span>
              </div>
            </div>

            {/* BMI + Disorder row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-sm text-on-surface-variant" htmlFor="bmi_category">
                  BMI Category
                </label>
                <select
                  id="bmi_category"
                  value={bmiCategory}
                  onChange={(e) => setBmiCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="Normal">Normal</option>
                  <option value="Underweight">Underweight</option>
                  <option value="Overweight">Overweight</option>
                  <option value="Obese">Obese</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="label-sm text-on-surface-variant" htmlFor="sleep_disorder">
                  Diagnosed Sleep Disorder
                </label>
                <select
                  id="sleep_disorder"
                  value={sleepDisorder}
                  onChange={(e) => setSleepDisorder(e.target.value)}
                  className="input-field"
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
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-12 py-4 text-[17px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin stroke-[2px]" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 stroke-[2px]" />
                <span>Prediksi Esok Hari</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ══════════════════════════════════════════════════ */}
      {/* Result Section — appears below after prediction   */}
      {/* ══════════════════════════════════════════════════ */}
      <div ref={resultRef} className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {result && (
          <div className="mt-12">
            {/* Header Title */}
            <div className="text-center mb-10">
              <h2 className="text-[32px] font-bold text-on-surface tracking-tight">Hasil Prediksi Esok Hari</h2>
              <p className="text-[15px] text-on-surface-variant mt-3 max-w-xl mx-auto leading-relaxed">
                {result.summary || "Berdasarkan data tidur dan pola aktivitas Anda hari ini, berikut adalah proyeksi kondisi fisiologis Anda."}
              </p>
            </div>

            {/* 2-Column Grid for Circular Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              
              {/* Fitness Score Card */}
              <div className="card relative flex flex-col items-center p-8">
                <div className="absolute top-6 right-6">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-[17px] font-bold text-on-surface mb-8">Predicted Fitness</h3>
                
                <CircularProgress score={result.fitness_score} colorClass={getScoreColorClass(result.fitness_score)} />
                
                <div className="mt-8 px-5 py-2 bg-primary-container text-on-primary-container rounded-full flex items-center gap-2 label-sm">
                  <TrendingUp className="w-4 h-4 stroke-[2px]" />
                  <span>{result.overall_level || 'High Capacity'}</span>
                </div>
              </div>

              {/* Wellbeing Index Card */}
              <div className="card relative flex flex-col items-center p-8">
                <div className="absolute top-6 right-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-[17px] font-bold text-on-surface mb-8">Predicted Wellbeing</h3>
                
                <CircularProgress score={result.wellbeing_index} colorClass={getScoreColorClass(result.wellbeing_index)} />
                
                <div className="mt-8 px-5 py-2 bg-primary-container text-on-primary-container rounded-full flex items-center gap-2 label-sm">
                  <Zap className="w-4 h-4 stroke-[2px]" />
                  <span>{result.sleep_risk_label || 'Peak State'}</span>
                </div>
              </div>

            </div>

            {/* Alert for Accuracy Info */}
            <div className="mb-8 p-4 rounded-md bg-surface-container-low border border-outline-variant flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[14px] text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface">Catatan Akurasi:</strong> Prediksi <strong>Wellbeing</strong> AI kami memiliki tingkat akurasi tinggi karena berhubungan langsung dengan kualitas tidur Anda. Sementara itu, prediksi <strong>Fitness Score</strong> lebih bersifat perkiraan, karena aktivitas fisik Anda esok hari juga sangat dipengaruhi oleh faktor luar (seperti kesibukan, cuaca, atau motivasi) yang tidak tercatat dalam pola tidur.
              </p>
            </div>

            {/* AI Recommendations Card */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="card mb-8 p-8">
                <h3 className="text-[22px] font-bold text-on-surface mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary-container flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-on-primary-container stroke-[2px]" />
                  </div>
                  <span>Rekomendasi AI</span>
                </h3>

                <div className="space-y-6">
                  {result.recommendations.map((rec, idx) => {
                    let IconComponent = Info;
                    let iconColor = 'text-primary';
                    let bgColor = 'bg-primary-container';

                    if (rec.message.toLowerCase().includes('tidur') || rec.message.toLowerCase().includes('sleep')) {
                      IconComponent = Moon;
                    } else if (rec.message.toLowerCase().includes('air') || rec.message.toLowerCase().includes('minum')) {
                      IconComponent = Droplet;
                    } else if (rec.message.toLowerCase().includes('waktu') || rec.message.toLowerCase().includes('jam')) {
                      IconComponent = Clock;
                    } else if (rec.priority === 'high') {
                      IconComponent = AlertTriangle;
                      iconColor = 'text-error';
                      bgColor = 'bg-error-container';
                    }

                    return (
                      <div key={idx} className="flex items-center gap-5 p-2">
                        <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                          <IconComponent className={`w-6 h-6 ${iconColor} stroke-[2px]`} />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className={`text-[15px] ${rec.action ? "font-semibold text-on-surface-variant" : "font-bold text-on-surface"}`}>{rec.message}</p>
                          {rec.action && <p className="text-[17px] font-bold text-on-surface mt-0.5">{rec.action}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Centered CTA Button */}
            <div className="flex justify-center mt-10">
              <Link
                to={`/chat?id=${result.id}`}
                className="btn-primary px-8 py-3.5 text-[17px] rounded-full"
              >
                <MessageSquare className="w-5 h-5 stroke-[2px]" />
                <span>Diskusikan Hasil dengan AI</span>
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultPage;
