import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, LogOut, Menu, X, User, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gradient-to-tr from-violet-600/30 to-blue-500/30 rounded-xl border border-violet-500/20 group-hover:border-violet-500/40 transition-colors"
            >
              <Moon className="w-5 h-5 text-violet-400 fill-violet-400/20 group-hover:fill-violet-400/40 transition-all" />
            </motion.div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              SleepWell AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/consult"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/consult')
                      ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Konsultasi
                </Link>
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/chat')
                      ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Tanya AI
                </Link>

                <div className="h-4 w-px bg-white/10 mx-2" />

                {/* Profile indicator */}
                <div className="flex items-center gap-3 pl-2">
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">Hai, tetap sehat</p>
                    <p className="text-sm font-bold text-slate-200">{user.name}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-xl transition-all cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  Masuk
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all border border-violet-500/30"
                  >
                    Daftar Gratis
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0a0e1a]/95 backdrop-blur-xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <div className="px-3 py-2 border-b border-white/5 mb-2">
                    <p className="text-xs text-slate-400">Pengguna</p>
                    <p className="text-sm font-bold text-violet-400">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/consult"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Konsultasi
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Tanya AI
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left rounded-xl text-base font-semibold text-red-400 hover:bg-red-500/10 mt-2"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block mx-3 my-2 text-center py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-xl text-base"
                  >
                    Daftar Gratis
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
