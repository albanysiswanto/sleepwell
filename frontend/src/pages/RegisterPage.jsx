import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Mail, Lock, User, AlertCircle, ArrowRight, ArrowLeft, Loader2, Award, Briefcase } from 'lucide-react';

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
        <div className="w-full max-w-lg card">
          {/* Logo Center */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-primary-container text-on-primary-container rounded-md mb-4">
              <Moon className="w-6 h-6 stroke-[2px]" />
            </div>
            <h1 className="text-[26px] font-bold text-on-surface">Buat Akun Baru</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">Lengkapi 2 langkah berikut untuk memulai</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 1 ? 'bg-primary ring-4 ring-primary/20' : 'bg-primary'}`} />
            <div className="w-12 h-[2px] bg-outline-variant" />
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === 2 ? 'bg-primary ring-4 ring-primary/20' : 'bg-outline-variant'}`} />
          </div>

          {/* Notifications */}
          {error && (
            <div className="flex items-start gap-2.5 p-4 mb-6 rounded-md bg-error-container border border-error-container text-on-error-container text-[15px]">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-4 mb-6 rounded-md bg-primary-container border border-primary-container text-on-primary-container text-[15px]">
              <Award className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Forms */}
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-5">
                <p className="label-sm text-on-surface-variant mb-2">Langkah 1/2 — Data Akun</p>

                <div className="space-y-2">
                  <label className="label-sm text-on-surface-variant" htmlFor="name">
                    Nama Lengkap *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant">
                      <User className="w-5 h-5 stroke-[2px]" />
                    </span>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      required
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-sm text-on-surface-variant" htmlFor="email">
                    Email *
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
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-sm text-on-surface-variant" htmlFor="password">
                    Password *
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
                      placeholder="Minimal 6 karakter"
                      required
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary w-full mt-6 py-3 text-[15px]"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-5 h-5 stroke-[2px]" />
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="label-sm text-on-surface-variant mb-2">Langkah 2/2 — Profil Konteks (Opsional)</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label-sm text-on-surface-variant" htmlFor="age">
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
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label-sm text-on-surface-variant" htmlFor="weight">
                      Berat (kg)
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
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-sm text-on-surface-variant" htmlFor="occupation">
                    Pekerjaan
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-on-surface-variant">
                      <Briefcase className="w-5 h-5 stroke-[2px]" />
                    </span>
                    <input
                      id="occupation"
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Pelajar, Pekerja, dll"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-sm text-on-surface-variant" htmlFor="gender">
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-field"
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
                    className="btn-secondary py-3 text-[15px]"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2px]" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-3 text-[15px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Mendaftar...</span>
                      </>
                    ) : (
                      <>
                        <span>Buat Akun</span>
                        <Award className="w-5 h-5 stroke-[2px]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer Link */}
          <div className="text-center text-[15px] text-on-surface-variant mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
