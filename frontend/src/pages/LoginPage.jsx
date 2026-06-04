import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Mini Header */}
      <nav className="p-6 border-b border-outline-variant">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="p-2 bg-primary-container text-on-primary-container rounded-md">
            <Moon className="w-5 h-5 stroke-[2px]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-on-surface">
            SleepWell
          </span>
        </Link>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md card">
          {/* Logo Center */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary-container text-on-primary-container rounded-md mb-4">
              <Moon className="w-6 h-6 stroke-[2px]" />
            </div>
            <h1 className="text-[26px] font-bold text-on-surface">Selamat Datang</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">Masuk ke akun SleepWell Anda</p>
          </div>

          {/* Alert Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-4 mb-6 rounded-md bg-error-container border border-error-container text-on-error-container text-[15px]">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="label-sm text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant">
                  <Mail className="w-5 h-5 stroke-[2px]" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  required
                  autoComplete="email"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-sm text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant">
                  <Lock className="w-5 h-5 stroke-[2px]" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password Anda"
                  required
                  autoComplete="current-password"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-[15px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-5 h-5 stroke-[2px]" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 text-on-surface-variant text-xs font-semibold tracking-wider">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="px-4">atau</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Footer Link */}
          <div className="text-center text-[15px] text-on-surface-variant">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Daftar gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
