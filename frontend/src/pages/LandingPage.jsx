import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Brain, MessageSquare, BarChart3, Shield, Zap, Target, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-[11px] font-semibold text-on-primary-container tracking-[0.06em] uppercase mb-6">
            <span>Powered by Hybrid ML & AI</span>
          </div>

          <h1 className="text-4xl sm:text-[48px] font-bold tracking-tight text-on-surface mb-6 leading-tight">
            Tidur Lebih Cerdas, Hidup Lebih Sehat
          </h1>

          <p className="text-on-surface-variant text-[17px] max-w-2xl mb-10 leading-relaxed">
            SleepWell menganalisis pola tidur dan aktivitas harianmu untuk memprediksi fitness score & wellbeing index esok hari — lengkap dengan rekomendasi klinis.
          </p>

          <div className="flex gap-4 flex-wrap justify-center mb-16">
            <Link to="/register" className="btn-primary">
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[2px]" />
            </Link>
            <Link to="/login" className="btn-secondary">
              Sudah punya akun?
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 sm:gap-16 border-t border-outline-variant pt-10 w-full max-w-lg">
            <div className="text-center">
              <p className="text-[32px] font-bold text-on-surface">3</p>
              <p className="label-sm text-on-surface-variant mt-1">Model ML</p>
            </div>
            <div className="text-center">
              <p className="text-[32px] font-bold text-on-surface">100%</p>
              <p className="label-sm text-on-surface-variant mt-1">Gratis</p>
            </div>
            <div className="text-center">
              <p className="text-[32px] font-bold text-on-surface">AI</p>
              <p className="label-sm text-on-surface-variant mt-1">Rekomendasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-container-low border-y border-outline-variant py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-on-surface">
              Mengapa SleepWell?
            </h2>
            <p className="mt-4 text-on-surface-variant max-w-xl mx-auto text-[17px]">
              Perpaduan teknologi Machine Learning dan AI untuk membantu memaksimalkan istirahat Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="card flex flex-col items-start text-left">
                <div className="p-2 bg-primary-container text-on-primary-container rounded-md mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-[22px] font-semibold text-on-surface mb-2">{feature.title}</h3>
                <p className="text-[15px] text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-on-surface">Cara Kerja</h2>
          </div>

          <div className="relative border-l border-outline-variant ml-4 md:ml-32 space-y-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12">
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-on-primary border-[4px] border-surface">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-[22px] font-semibold text-on-surface mb-2">{step.title}</h3>
                  <p className="text-[15px] text-on-surface-variant leading-relaxed max-w-2xl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center px-4 border-t border-outline-variant bg-surface-container-low">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[32px] font-bold text-on-surface mb-6">
            Siap tidur lebih cerdas?
          </h2>
          <p className="text-[17px] text-on-surface-variant mx-auto mb-10 leading-relaxed">
            Mulailah hari baru dengan bangun dalam kondisi yang segar dan bugar.
          </p>
          <div className="w-fit mx-auto">
            <Link to="/register" className="btn-primary">
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[2px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant py-8 text-center bg-surface">
        <p className="label-sm text-on-surface-variant">© 2026 SleepWell · Dibangun untuk kesehatan tidur Indonesia</p>
      </footer>
    </div>
  );
};

const steps = [
  {
    title: 'Daftar & Lengkapi Profil',
    desc: 'Masukkan data demografis sebagai konteks awal untuk prediksi yang personal dan akurat.',
  },
  {
    title: 'Input Data Harian',
    desc: 'Isi jurnal meliputi durasi tidur, jumlah langkah, aktivitas fisik intens, dan tingkat stres.',
  },
  {
    title: 'Analisis Prediktif',
    desc: 'Model Machine Learning memproses dan menilai data aktivitas dan kualitas tidur Anda.',
  },
  {
    title: 'Dapatkan Laporan',
    desc: 'Terima fitness score & wellbeing index, beserta saran klinis perbaikan pola tidur.',
  },
];

const features = [
  {
    icon: <Brain className="w-6 h-6 stroke-[2px]" />,
    title: 'Prediksi ML Canggih',
    desc: 'Memanfaatkan Random Forest, XGBoost, dan Deep Learning untuk memprediksi kebugaran.',
  },
  {
    icon: <MessageSquare className="w-6 h-6 stroke-[2px]" />,
    title: 'Konsultasi AI',
    desc: 'Asisten virtual berbasis LLM memberikan tips tidur personal berbasis data jurnal Anda.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 stroke-[2px]" />,
    title: 'Dashboard Analitik',
    desc: 'Pantau riwayat kualitas tidur dan skor kebugaran dari waktu ke waktu secara terstruktur.',
  },
  {
    icon: <Shield className="w-6 h-6 stroke-[2px]" />,
    title: 'Data Terenkripsi',
    desc: 'Kerahasiaan data Anda terlindungi dengan standar enkripsi yang aman.',
  },
  {
    icon: <Zap className="w-6 h-6 stroke-[2px]" />,
    title: 'Respons Cepat',
    desc: 'Hasil prediksi instan dengan dukungan server backend berperforma tinggi.',
  },
  {
    icon: <Target className="w-6 h-6 stroke-[2px]" />,
    title: 'Berbasis Konteks',
    desc: 'Rekomendasi menyesuaikan dengan usia, berat badan, serta rutinitas harian.',
  },
];

export default LandingPage;
