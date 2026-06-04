-- ============================================================
-- SleepWell AI — Supabase Schema
-- Jalankan ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  age         INTEGER CHECK (age > 0 AND age <= 120),
  weight      REAL CHECK (weight > 0),
  occupation  TEXT,
  gender      TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sleep Logs Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date            DATE NOT NULL,
  sleep_duration      REAL NOT NULL CHECK (sleep_duration >= 0 AND sleep_duration <= 24),
  sleep_quality       INTEGER NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
  stress_level        INTEGER NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
  physical_activity   INTEGER NOT NULL DEFAULT 0,
  total_steps         INTEGER DEFAULT 0,
  calories_burned     REAL DEFAULT 0,
  very_active_minutes INTEGER DEFAULT 0,
  sedentary_minutes   INTEGER DEFAULT 0,
  bmi_category        TEXT DEFAULT 'Normal',
  sleep_disorder      TEXT DEFAULT 'None',
  heart_rate          REAL,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Predictions Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.predictions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sleep_log_id     UUID REFERENCES public.sleep_logs(id) ON DELETE SET NULL,
  predicted_at     TIMESTAMPTZ DEFAULT NOW(),
  fitness_score    REAL,
  wellbeing_index  REAL,
  sleep_risk_label TEXT,
  model_version    TEXT DEFAULT '1.0',
  input_snapshot   JSONB,
  recommendation   JSONB
);

-- ── Recommendations Table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recommendations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  priority      TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  message       TEXT NOT NULL,
  action        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id ON public.sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_log_date ON public.sleep_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_predicted_at ON public.predictions(predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_prediction_id ON public.recommendations(prediction_id);

-- ── Row Level Security (RLS) ──────────────────────────────────
-- PENTING: Kita pakai service_role_key di backend, jadi RLS bisa disabled
-- atau dibiarkan karena service role bypass RLS otomatis.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations DISABLE ROW LEVEL SECURITY;
