import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Moon, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Mohon isi semua field.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Coba lagi.');
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
          className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/40 rounded-3xl p-8"
        >
          {/* Logo Center */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-violet-600/20 to-blue-500/20 border border-violet-500/20 rounded-2xl mb-4">
              <Moon className="w-8 h-8 text-violet-400 fill-violet-400/20" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Selamat Datang</h1>
            <p className="text-sm text-slate-400 mt-1">Masuk ke akun SleepWell AI Anda</p>
          </div>

          {/* Alert Error */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400" htmlFor="email">
                Email
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
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.06] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400" htmlFor="password">
                Password
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
                  placeholder="Password Anda"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.06] border border-white/5 focus:border-violet-500/50 rounded-2xl text-slate-200 placeholder-slate-500 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 border border-violet-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 text-slate-600 text-xs font-semibold tracking-wider">
            <div className="flex-1 h-px bg-white/5" />
            <span className="px-4">atau</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Footer Link */}
          <div className="text-center text-sm text-slate-400">
            Belum punya akun?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold hover:underline">
              Daftar gratis
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
