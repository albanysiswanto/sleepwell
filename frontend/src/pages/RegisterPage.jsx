import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Mail, Lock, User, AlertCircle, ArrowRight, ArrowLeft, Loader2, Award, Briefcase, Calendar } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Context Fields (Optional)
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('');

  const handleNextStep = () => {
    if (!name || !email || !password) {
      setError('Mohon lengkapi semua field yang wajib.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal terdiri dari 6 karakter.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = { name, email, password };
    if (age) payload.age = parseInt(age);
    if (weight) payload.weight = parseFloat(weight);
    if (occupation) payload.occupation = occupation;
    if (gender) payload.gender = gender;

    try {
      await register(payload);
      setSuccess('Akun berhasil dibuat! Mengarahkan ke halaman masuk...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mini Header */}
      <nav className="p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <Moon className="w-6 h-6 text-violet-400 fill-violet-400/20" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            SleepWell AI
          </span>
        </Link>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/40 rounded-3xl p-8"
        >
          {/* Logo Center */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-gradient-to-tr from-violet-600/20 to-blue-500/20 border border-violet-500/20 rounded-2xl mb-4">
              <Moon className="w-8 h-8 text-violet-400 fill-violet-400/20" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Buat Akun Baru</h1>
            <p className="text-sm text-slate-400 mt-1">Lengkapi 2 langkah berikut untuk memulai</p>
          </div>

          {/* Step Indicator dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === 1 ? 'bg-violet-500 ring-4 ring-violet-500/20 scale-125' : 'bg-green-500'}`} />
            <div className="w-12 h-0.5 bg-white/10" />
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === 2 ? 'bg-violet-500 ring-4 ring-violet-500/20 scale-125' : 'bg-white/10'}`} />
          </div>

          {/* Notifications */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-4 mb-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm leading-relaxed"
            >
              <Award className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Multi-step Forms */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-5"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Langkah 1/2 — Data Akun</p>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="name">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama Anda"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all focus:ring-4 focus:ring-violet-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="email">
                      Email *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@contoh.com"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all focus:ring-4 focus:ring-violet-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="password">
                      Password *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all focus:ring-4 focus:ring-violet-500/10"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 border border-violet-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-6"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-5"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Langkah 2/2 — Profil Konteks (Opsional)
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400" htmlFor="age">
                        Usia (tahun)
                      </label>
                      <input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        min="1"
                        max="120"
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400" htmlFor="weight">
                        Berat Badan (kg)
                      </label>
                      <input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="65"
                        min="20"
                        max="300"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="occupation">
                      Pekerjaan
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Briefcase className="w-4 h-4" />
                      </span>
                      <input
                        id="occupation"
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Software Engineer, Pelajar, dll"
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="gender">
                      Jenis Kelamin
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111625] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-300 text-sm outline-none transition-all"
                    >
                      <option value="">Pilih (opsional)</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-2xl border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 border border-violet-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mendaftar...</span>
                        </>
                      ) : (
                        <>
                          <span>Buat Akun</span>
                          <Award className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer Link */}
          <div className="text-center text-sm text-slate-400 mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
