import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Sparkles, Brain, MessageSquare, BarChart3, Shield, Zap, Target, Moon, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const floatAnimation = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 4,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Animated Float Moon */}
          <motion.div 
            variants={floatAnimation} 
            animate="animate" 
            className="mb-6 cursor-pointer"
          >
            <div className="p-5 bg-gradient-to-tr from-violet-600/20 to-blue-500/20 border border-violet-500/30 rounded-3xl shadow-xl shadow-violet-500/10">
              <Moon className="w-16 h-16 text-violet-400 fill-violet-400/10" />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Powered by Hybrid Machine Learning & AI</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            Tidur Lebih Cerdas,<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
              Hidup Lebih Sehat
            </span>
          </motion.h1>

          {/* Desc */}
          <motion.p
            variants={itemVariants}
            className="text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed"
          >
            SleepWell AI menganalisis pola tidur dan aktivitas harianmu untuk memprediksi{' '}
            <strong className="text-violet-300 font-semibold">fitness score & wellbeing index</strong>{' '}
            esok hari — lengkap dengan rekomendasi AI yang sangat personal.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex gap-4 flex-wrap justify-center mb-16">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 border border-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sudah punya akun?
            </Link>
          </motion.div>

          {/* Mini Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 sm:gap-16 border-t border-white/5 pt-10 w-full max-w-lg"
          >
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">3</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Model ML</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent">100%</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Gratis</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">AI</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Powered Tips</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white/[0.02] border-t border-white/5 py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Mengapa SleepWell AI?
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Perpaduan teknologi Machine Learning dan Generative AI untuk membantu memaksimalkan istirahat Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, borderColor: 'rgba(124,58,237,0.3)' }}
                className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:shadow-2xl hover:shadow-violet-600/5 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-tr from-violet-600/10 to-blue-500/10 border border-violet-500/10 rounded-2xl w-fit mb-6 text-violet-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Cara Kerja</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Hanya 4 langkah mudah untuk mendapatkan analisis tidur berkualitas tinggi.
            </p>
          </div>

          <div className="relative border-l border-white/5 ml-4 md:ml-32 space-y-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12 group">
                {/* Step Circle Indicator */}
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center font-extrabold text-xs text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl mb-6">
            Siap tidur lebih cerdas? 🌙
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Mulailah hari baru dengan bangun dalam kondisi yang segar dan bugar. Gratis dan mudah untuk dicoba sekarang juga.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-fit mx-auto">
            <Link
              to="/register"
              className="inline-flex px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/30 border border-violet-500/20 hover:scale-105 active:scale-95 transition-all items-center gap-2 group"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SleepWell AI · CC26-PSU283 Team · Dibuat dengan ❤️ untuk kesehatan tidur Indonesia</p>
        </div>
      </footer>
    </div>
  );
};

const steps = [
  {
    title: 'Daftar & Lengkapi Profil',
    desc: 'Masukkan nama, usia, berat badan, dan pekerjaan sebagai konteks awal untuk prediksi kesehatan tidur yang personal dan lebih akurat.',
  },
  {
    title: 'Input Data Harian',
    desc: 'Isi kuesioner singkat meliputi durasi tidur Anda, kualitas tidur, jumlah langkah, aktivitas fisik intens, dan tingkat stres hari ini.',
  },
  {
    title: 'AI Menganalisis',
    desc: 'Tiga model Machine Learning yang canggih (Random Forest, XGBoost, TensorFlow Deep Learning) memproses dan menilai data aktivitas fisik dan kualitas tidur Anda.',
  },
  {
    title: 'Dapatkan Rekomendasi',
    desc: 'Dapatkan prediksi nilai fitness & wellbeing untuk esok hari, beserta tips perbaikan tidur personal berbasis sains dan konsultasi cerdas dengan AI.',
  },
];

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Prediksi ML Canggih',
    desc: 'Memanfaatkan Random Forest, XGBoost, dan Deep Learning dengan Attention Layer untuk mengolah data tidur dan memprediksi kebugaran esok hari.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Konsultasi & Tips AI',
    desc: 'Hubungi asisten virtual berbasis Groq LLM (Llama 3.3 70B) untuk mendapatkan tips tidur cerdas dan personal dalam Bahasa Indonesia.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Dashboard Analitik',
    desc: 'Pantau riwayat tren kualitas tidur, rata-rata kebugaran fisik, dan evaluasi hasil konsultasi Anda dari waktu ke waktu secara interaktif.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Data Terenkripsi',
    desc: 'Kerahasiaan data Anda terlindungi dengan aman menggunakan autentikasi terenkripsi JWT (JSON Web Tokens) dan hashing sandi yang kuat.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Respons Sangat Cepat',
    desc: 'Hasil kalkulasi prediksi keluar instan dengan dukungan server backend berkinerja tinggi serta fallback cerdas berbasis aturan (rule-based).',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Personal & Kontekstual',
    desc: 'Menyesuaikan rekomendasi berdasarkan detail kontekstual tubuh Anda seperti usia, berat badan, serta aktivitas fisik harian terukur.',
  },
];

export default LandingPage;
