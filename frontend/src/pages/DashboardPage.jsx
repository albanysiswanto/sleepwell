import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  BarChart3, Brain, User, LogOut, Plus, 
  MessageSquare, Calendar, Loader2, Moon 
} from 'lucide-react';
import LogoutModal from '../components/LogoutModal';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const updatedUser = await fetchProfile();
        const metaParts = [
          updatedUser.age ? `${updatedUser.age} thn` : null,
          updatedUser.weight ? `${updatedUser.weight} kg` : null,
          updatedUser.occupation || null,
          updatedUser.gender ? (updatedUser.gender === 'male' ? 'Laki-laki' : updatedUser.gender === 'female' ? 'Perempuan' : 'Lainnya') : null
        ].filter(Boolean);
        setProfileMeta(metaParts.join(' · ') || 'Profil belum lengkap');

        const response = await axios.get(`${API_BASE}/predictions?limit=20`);
        const preds = response.data.data.predictions || [];
        const total = response.data.data.pagination?.total || 0;
        setPredictions(preds);

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

  const getScoreColor = (score) => {
    if (score >= 65) return 'text-primary';
    if (score >= 45) return 'text-on-surface-variant';
    return 'text-error';
  };

  const getRiskColor = (label) => {
    if (!label) return 'text-primary';
    if (label.includes('Low')) return 'text-primary';
    if (label.includes('Moderate')) return 'text-on-surface-variant';
    return 'text-error';
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Selamat pagi';
    if (hours < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      <div className="flex-1 flex flex-col md:grid md:grid-cols-[260px_1fr] max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col gap-1 p-2 bg-surface-container-low border border-outline-variant rounded-lg h-[calc(100vh-140px)] sticky top-24">
          <p className="label-sm text-on-surface-variant px-4 py-3">Menu</p>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-primary bg-primary-container font-semibold border border-transparent"
          >
            <BarChart3 className="w-4 h-4 stroke-[2px]" />
            <span className="text-[15px]">Dashboard</span>
          </Link>
          <Link
            to="/consult"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-[15px] font-semibold"
          >
            <Brain className="w-4 h-4 stroke-[2px]" />
            <span>Konsultasi</span>
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-[15px] font-semibold"
          >
            <MessageSquare className="w-4 h-4 stroke-[2px]" />
            <span>Tanya AI</span>
          </Link>

          <p className="label-sm text-on-surface-variant px-4 py-3 mt-6">Akun</p>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-error hover:bg-error-container transition-all text-[15px] font-semibold text-left w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2px]" />
            <span>Keluar</span>
          </button>

          {user && (
            <div className="mt-auto p-4 bg-surface-container border border-outline-variant rounded-md">
              <p className="font-semibold text-on-surface text-[15px] truncate">{user.name}</p>
              <p className="text-on-surface-variant text-[13px] truncate mt-0.5">{user.email}</p>
            </div>
          )}
        </aside>

        {/* Main Panel */}
        <main className="flex-1 flex flex-col min-w-0">
          
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-on-surface">Dashboard</h1>
            <p className="text-on-surface-variant text-[15px] mt-1">
              {getGreeting()}, {user?.name}!
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-error-container border border-error-container text-on-error-container text-[15px]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-[15px] font-medium">Memuat data dashboard...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Profile Banner */}
              <div className="card flex flex-col sm:flex-row items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-md bg-primary-container text-on-primary-container font-bold text-[22px] flex items-center justify-center border border-primary/20">
                    {userInitials}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-bold text-on-surface text-[22px] leading-snug">{user?.name}</p>
                    <p className="text-[13px] text-on-surface-variant font-semibold mt-0.5">{profileMeta}</p>
                  </div>
                </div>
                <Link to="/consult" className="btn-primary">
                  <Brain className="w-4 h-4 stroke-[2px]" />
                  <span>Konsultasi Sekarang</span>
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card hover:border-outline transition-all">
                  <p className="text-[32px] font-bold text-on-surface">{stats.total}</p>
                  <p className="label-sm text-on-surface-variant mt-1">Total Prediksi</p>
                </div>
                <div className="card hover:border-outline transition-all">
                  <p className="text-[32px] font-bold text-primary">{stats.avgFitness}</p>
                  <p className="label-sm text-on-surface-variant mt-1">Avg Fitness Score</p>
                </div>
                <div className="card hover:border-outline transition-all">
                  <p className="text-[32px] font-bold text-primary">{stats.avgWellbeing}</p>
                  <p className="label-sm text-on-surface-variant mt-1">Avg Wellbeing Index</p>
                </div>
                <div className="card hover:border-outline transition-all">
                  <p className="text-[15px] font-semibold text-on-surface mt-2 truncate">{stats.lastConsult}</p>
                  <p className="label-sm text-on-surface-variant mt-2.5">Konsultasi Terakhir</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/consult"
                  className="card hover:bg-surface-container transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 bg-primary-container text-on-primary-container rounded-md">
                    <Plus className="w-6 h-6 stroke-[2px]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface text-[15px]">Konsultasi Baru</h3>
                    <p className="text-on-surface-variant text-[13px] mt-0.5">Input data tidur & aktivitas hari ini</p>
                  </div>
                </Link>

                <Link
                  to="/chat"
                  className="card hover:bg-surface-container transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 bg-primary-container text-on-primary-container rounded-md">
                    <MessageSquare className="w-6 h-6 stroke-[2px]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface text-[15px]">Tanya AI</h3>
                    <p className="text-on-surface-variant text-[13px] mt-0.5">Diskusikan masalah tidurmu langsung ke AI</p>
                  </div>
                </Link>
              </div>

              {/* History Table */}
              <div className="card">
                <h3 className="font-bold text-on-surface mb-6 flex items-center gap-2 text-[17px]">
                  <Calendar className="w-5 h-5 stroke-[2px] text-primary" />
                  <span>Riwayat Prediksi</span>
                </h3>

                {predictions.length > 0 ? (
                  <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-outline-variant">
                          <th className="label-sm text-on-surface-variant px-4 py-4">Tanggal</th>
                          <th className="label-sm text-on-surface-variant px-4 py-4">Fitness Score</th>
                          <th className="label-sm text-on-surface-variant px-4 py-4">Wellbeing Index</th>
                          <th className="label-sm text-on-surface-variant px-4 py-4">Sleep Risk</th>
                          <th className="label-sm text-on-surface-variant px-4 py-4">Model Version</th>
                          <th className="label-sm text-on-surface-variant px-4 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {predictions.map((p) => {
                          const formattedDate = new Date(p.predicted_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          
                          return (
                            <tr key={p.id} className="hover:bg-surface-container transition-colors">
                              <td className="px-4 py-4 text-[15px] font-medium text-on-surface">{formattedDate}</td>
                              <td className="px-4 py-4">
                                <span className={`font-bold text-[15px] ${getScoreColor(p.fitness_score)}`}>
                                  {p.fitness_score ?? '—'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`font-bold text-[15px] ${getScoreColor(p.wellbeing_index)}`}>
                                  {p.wellbeing_index ?? '—'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`badge border border-outline-variant ${getRiskColor(p.sleep_risk_label)}`}>
                                  {p.sleep_risk_label || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-[13px] font-medium text-on-surface-variant">{p.model_version || '—'}</td>
                              <td className="px-4 py-4 text-right">
                                <Link to={`/chat?id=${p.id}`} className="btn-secondary py-1.5 px-3 text-[12px] inline-flex">
                                  <MessageSquare className="w-3.5 h-3.5 stroke-[2px]" /> Tanya AI
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center gap-4 text-on-surface-variant">
                    <div className="p-4 bg-surface-container rounded-md">
                      <Moon className="w-8 h-8 stroke-[2px]" />
                    </div>
                    <p className="text-[15px] font-medium">Belum ada riwayat prediksi tidur.</p>
                    <Link
                      to="/consult"
                      className="text-primary font-semibold hover:underline text-[15px]"
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

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={confirmLogout} 
      />
    </div>
  );
};

export default DashboardPage;
