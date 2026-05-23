import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart3, Brain, User, LogOut, Sparkles, Plus, 
  MessageSquare, Calendar, Award, ShieldAlert, Zap, Loader2 
} from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileMeta, setProfileMeta] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgFitness: '—',
    avgWellbeing: '—',
    lastConsult: '—'
  });
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch latest profile
        const updatedUser = await fetchProfile();
        const metaParts = [
          updatedUser.age ? `${updatedUser.age} thn` : null,
          updatedUser.weight ? `${updatedUser.weight} kg` : null,
          updatedUser.occupation || null,
          updatedUser.gender ? (updatedUser.gender === 'male' ? 'Laki-laki' : updatedUser.gender === 'female' ? 'Perempuan' : 'Lainnya') : null
        ].filter(Boolean);
        setProfileMeta(metaParts.join(' · ') || 'Profil belum lengkap');

        // 2. Fetch history
        const response = await axios.get(`${API_BASE}/predictions?limit=20`);
        const preds = response.data.data.predictions || [];
        const total = response.data.data.pagination?.total || 0;
        setPredictions(preds);

        // 3. Compute stats
        if (preds.length > 0) {
          const totalFitness = preds.reduce((acc, p) => acc + (p.fitness_score || 0), 0);
          const totalWellbeing = preds.reduce((acc, p) => acc + (p.wellbeing_index || 0), 0);
          
          const avgFit = (totalFitness / preds.length).toFixed(1);
          const avgWel = (totalWellbeing / preds.length).toFixed(1);

          const lastDate = new Date(preds[0].predicted_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
          });

          setStats({
            total,
            avgFitness: avgFit,
            avgWellbeing: avgWel,
            lastConsult: lastDate
          });
        } else {
          setStats({
            total: 0,
            avgFitness: '—',
            avgWellbeing: '—',
            lastConsult: '—'
          });
        }
      } catch (err) {
        console.error('Gagal memuat dashboard:', err);
        setError('Gagal memuat data dashboard. Silakan refresh halaman.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getScoreBadgeClass = (score) => {
    if (score >= 65) return 'bg-green-500/10 text-green-400 border border-green-500/20';
    if (score >= 45) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  const getRiskBadgeClass = (label) => {
    if (!label) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    if (label.includes('Low')) return 'bg-green-500/10 text-green-400 border border-green-500/20';
    if (label.includes('Moderate')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Selamat pagi';
    if (hours < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col md:grid md:grid-cols-[260px_1fr] max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col gap-1 p-2 bg-white/[0.02] border border-white/5 rounded-3xl h-[calc(100vh-140px)] sticky top-24">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-3">Menu</p>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-violet-300 bg-violet-500/10 font-bold border border-violet-500/15"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link
            to="/consult"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-sm font-semibold"
          >
            <Brain className="w-4 h-4" />
            <span>Konsultasi</span>
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-sm font-semibold"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tanya AI</span>
          </Link>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-3 mt-6">Akun</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold text-left w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>

          {/* User profile card box */}
          {user && (
            <div className="mt-auto p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              <p className="font-bold text-slate-200 text-sm truncate">{user.name}</p>
              <p className="text-slate-500 text-xs truncate mt-0.5">{user.email}</p>
            </div>
          )}
        </aside>

        {/* Main Panel */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              {getGreeting()}, {user?.name}! 👋
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                <span className="text-sm font-medium">Memuat data dashboard...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Profile Banner Context */}
              <div className="p-6 bg-gradient-to-r from-violet-600/15 via-fuchsia-600/5 to-blue-500/15 border border-violet-500/20 rounded-3xl flex flex-col sm:flex-row items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                    {userInitials}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-extrabold text-slate-200 text-lg leading-snug">{user?.name}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{profileMeta}</p>
                  </div>
                </div>
                <Link
                  to="/consult"
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all border border-violet-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Brain className="w-4 h-4" />
                  <span>Konsultasi Sekarang</span>
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all">
                  <p className="text-3xl font-extrabold text-white">{stats.total}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Total Prediksi</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all">
                  <p className="text-3xl font-extrabold text-violet-400">{stats.avgFitness}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Avg Fitness Score</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all">
                  <p className="text-3xl font-extrabold text-blue-400">{stats.avgWellbeing}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Avg Wellbeing Index</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all">
                  <p className="text-sm font-bold text-slate-200 mt-2 truncate">{stats.lastConsult}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-2.5">Konsultasi Terakhir</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/consult"
                  className="p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-violet-500/20 rounded-3xl flex items-center gap-4 group transition-all"
                >
                  <div className="p-3 bg-violet-500/10 text-violet-400 rounded-2xl group-hover:scale-105 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">Konsultasi Baru</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Input data tidur & aktivitas hari ini</p>
                  </div>
                </Link>

                <Link
                  to="/chat"
                  className="p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-blue-500/20 rounded-3xl flex items-center gap-4 group transition-all"
                >
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">Tanya Tips AI</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Diskusikan masalah tidurmu langsung ke AI</p>
                  </div>
                </Link>
              </div>

              {/* History Table */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                <h3 className="font-extrabold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-400" />
                  <span>Riwayat Prediksi</span>
                </h3>

                {predictions.length > 0 ? (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-xs font-bold text-slate-500 uppercase tracking-widest px-6 py-4">Tanggal</th>
                          <th className="text-xs font-bold text-slate-500 uppercase tracking-widest px-6 py-4">Fitness Score</th>
                          <th className="text-xs font-bold text-slate-500 uppercase tracking-widest px-6 py-4">Wellbeing Index</th>
                          <th className="text-xs font-bold text-slate-500 uppercase tracking-widest px-6 py-4">Sleep Risk</th>
                          <th className="text-xs font-bold text-slate-500 uppercase tracking-widest px-6 py-4">Model Version</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {predictions.map((p) => {
                          const formattedDate = new Date(p.predicted_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          
                          return (
                            <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-slate-300">{formattedDate}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getScoreBadgeClass(p.fitness_score)}`}>
                                  {p.fitness_score ?? '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getScoreBadgeClass(p.wellbeing_index)}`}>
                                  {p.wellbeing_index ?? '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getRiskBadgeClass(p.sleep_risk_label)}`}>
                                  {p.sleep_risk_label || '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-500">{p.model_version || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center gap-4 text-slate-500">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                      <Moon className="w-12 h-12 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium">Belum ada riwayat prediksi tidur.</p>
                    <Link
                      to="/consult"
                      className="text-violet-400 hover:text-violet-300 font-bold hover:underline text-sm"
                    >
                      Mulai Konsultasi Pertamamu &rarr;
                    </Link>
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
