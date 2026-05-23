'use strict';

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../database/db');
const { createError } = require('../middlewares/error.middleware');

// ── FastAPI client ────────────────────────────────────────────
const mlApi = axios.create({
  baseURL: process.env.ML_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Rule-based fallback ───────────────────────────────────────
const normalize = (val, min, max) => Math.min(1, Math.max(0, (val - min) / (max - min)));

const calcFitnessScore = (input) => {
  const norm = {
    sleep_duration:    normalize(input.sleep_duration, 3, 10),
    sleep_quality:     normalize(input.sleep_quality, 1, 10),
    stress_level:      normalize(input.stress_level, 1, 10),
    physical_activity: normalize(input.physical_activity || 0, 0, 120),
    total_steps:       normalize(input.total_steps || 0, 0, 20000),
  };
  let score = 50;
  score += 0.30 * norm.sleep_duration * 50;
  score += 0.25 * norm.sleep_quality * 50;
  score -= 0.20 * norm.stress_level * 50;
  score += 0.15 * norm.physical_activity * 50;
  score += 0.10 * norm.total_steps * 50;
  return Math.round(Math.min(100, Math.max(0, score)) * 10) / 10;
};

const calcWellbeingIndex = (input) => {
  const norm = {
    sleep_quality:     normalize(input.sleep_quality, 1, 10),
    sleep_duration:    normalize(input.sleep_duration, 3, 10),
    stress_level:      normalize(input.stress_level, 1, 10),
    physical_activity: normalize(input.physical_activity || 0, 0, 120),
  };
  let index = 50;
  index += 0.30 * norm.sleep_quality * 50;
  index += 0.25 * norm.sleep_duration * 50;
  index -= 0.25 * norm.stress_level * 50;
  index += 0.20 * norm.physical_activity * 50;
  return Math.round(Math.min(100, Math.max(0, index)) * 10) / 10;
};

const getSleepRiskLabel = (input) => {
  if (input.sleep_duration < 5 || input.sleep_quality <= 3) return 'High Risk';
  if (input.sleep_duration < 6.5 || input.sleep_quality <= 5) return 'Moderate Risk';
  return 'Low Risk';
};

const generateRuleBasedRecs = (input) => {
  const recs = [];
  if (input.sleep_duration < 7) recs.push({ category: 'sleep_duration', priority: 'high', message: 'Durasi tidur Anda kurang dari 7 jam. Kurang tidur menurunkan konsentrasi dan imunitas.', action: 'Coba tidur 30 menit lebih awal dan pertahankan jadwal tidur konsisten.' });
  else if (input.sleep_duration > 9) recs.push({ category: 'sleep_duration', priority: 'medium', message: 'Durasi tidur lebih dari 9 jam. Tidur berlebihan bisa berhubungan dengan kelelahan.', action: 'Evaluasi apakah Anda merasa segar saat bangun.' });
  if (input.sleep_quality <= 4) recs.push({ category: 'sleep_quality', priority: 'high', message: 'Kualitas tidur sangat rendah. Ini mempengaruhi produktivitas dan kesehatan mental.', action: 'Hindari layar 1 jam sebelum tidur. Pastikan kamar gelap dan sejuk.' });
  if (input.stress_level >= 7) recs.push({ category: 'stress', priority: 'high', message: 'Tingkat stres sangat tinggi dan mengganggu kualitas tidur.', action: 'Coba meditasi 10 menit, pernapasan dalam, atau journaling sebelum tidur.' });
  else if (input.stress_level >= 5) recs.push({ category: 'stress', priority: 'medium', message: 'Stres moderat. Manajemen stres dapat meningkatkan kualitas tidur.', action: 'Jadwalkan istirahat dan kurangi beban kerja mendekati waktu tidur.' });
  if ((input.physical_activity || 0) < 30) recs.push({ category: 'activity', priority: 'medium', message: 'Aktivitas fisik masih kurang.', action: 'Mulai dengan 20-30 menit jalan kaki setiap hari.' });
  if ((input.total_steps || 0) < 5000) recs.push({ category: 'steps', priority: 'low', message: 'Kurang dari 5.000 langkah per hari. WHO rekomendasikan 7.000-8.000 langkah.', action: 'Gunakan tangga, berjalan saat istirahat siang.' });
  return recs;
};

// ── Map Express input → FastAPI format ───────────────────────
const toFastApiPayload = (input) => {
  const bmiMap = { Underweight: 'Normal', Normal: 'Normal', Overweight: 'Overweight', Obese: 'Overweight' };
  return {
    sleep_duration:    input.sleep_duration,
    sleep_efficiency:  parseFloat((input.sleep_efficiency || 0.85).toFixed(2)),
    TotalSteps:        input.total_steps || 0,
    VeryActiveMinutes: input.very_active_minutes || 0,
    stress_level:      input.stress_level,
    sleep_quality:     input.sleep_quality,
    BMI_category:      bmiMap[input.bmi_category] || 'Normal',
    sleep_disorder:    input.sleep_disorder || 'None',
    model_type:        input.model_type || 'rf',
  };
};

// ── Persist to Supabase ───────────────────────────────────────
const savePrediction = async ({ userId, inputBody, fitnessScore, wellbeingIndex, sleepRiskLabel, source, recs }) => {
  const predId = uuidv4();
  const { error: predErr } = await supabase.from('predictions').insert({
    id: predId,
    user_id: userId,
    sleep_log_id: inputBody.sleep_log_id || null,
    fitness_score: fitnessScore,
    wellbeing_index: wellbeingIndex,
    sleep_risk_label: sleepRiskLabel,
    model_version: source === 'ml_model' ? 'ml-1.0' : 'rule-based-1.0',
    input_snapshot: inputBody,
    recommendation: recs,
  });
  if (predErr) throw new Error(predErr.message);

  if (recs.length > 0) {
    const recRows = recs.map((r) => ({
      id: uuidv4(), user_id: userId, prediction_id: predId,
      category: r.category, priority: r.priority,
      message: r.message, action: r.action || '',
    }));
    const { error: recErr } = await supabase.from('recommendations').insert(recRows);
    if (recErr) throw new Error(recErr.message);
  }
  return predId;
};

// ─────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────

// POST /api/predictions — quick predict
const predict = async (req, res, next) => {
  try {
    const input = req.body;
    const userId = req.user.id;
    let fitnessScore, wellbeingIndex, sleepRiskLabel, source;

    try {
      const { data: mlData } = await mlApi.post('/predict', toFastApiPayload(input));
      fitnessScore   = mlData.fitness_score_next_day;
      wellbeingIndex = mlData.wellbeing_next_day;
      source = 'ml_model';
    } catch (_) {
      fitnessScore   = calcFitnessScore(input);
      wellbeingIndex = calcWellbeingIndex(input);
      source = 'rule_based';
    }
    sleepRiskLabel = getSleepRiskLabel(input);
    const recs = generateRuleBasedRecs(input);
    const predId = await savePrediction({ userId, inputBody: input, fitnessScore, wellbeingIndex, sleepRiskLabel, source, recs });

    return res.status(201).json({
      status: 'success',
      data: { prediction: { id: predId, fitness_score: fitnessScore, wellbeing_index: wellbeingIndex, sleep_risk_label: sleepRiskLabel, source, recommendations: recs } },
    });
  } catch (err) { next(err); }
};

// POST /api/predictions/consult — ML recommend + rule-based
const consult = async (req, res, next) => {
  try {
    const input = req.body;
    const userId = req.user.id;
    let fitnessScore, wellbeingIndex, sleepRiskLabel, source;
    let mlRecs = [], overallLevel = null, summary = null;

    try {
      const { data: mlData } = await mlApi.post('/recommend', toFastApiPayload(input));
      fitnessScore   = mlData.recommendation.fitness_score_next_day;
      wellbeingIndex = mlData.recommendation.wellbeing_next_day;
      overallLevel   = mlData.recommendation.overall_level;
      summary        = mlData.recommendation.summary;
      mlRecs = (mlData.recommendation.recommendations || []).map((m) => ({ category: 'ml', priority: 'high', message: m, action: '' }));
      source = 'ml_model';
    } catch (_) {
      fitnessScore   = calcFitnessScore(input);
      wellbeingIndex = calcWellbeingIndex(input);
      source = 'rule_based';
    }

    sleepRiskLabel = getSleepRiskLabel(input);
    const ruleRecs = generateRuleBasedRecs(input);
    const allRecs  = [...mlRecs, ...ruleRecs];

    if (!overallLevel) {
      overallLevel = fitnessScore >= 65 ? 'BAIK 🟢' : fitnessScore >= 45 ? 'SEDANG 🟡' : 'PERLU PERHATIAN 🔴';
    }
    if (!summary) summary = `Prediksi fitness: ${fitnessScore} | wellbeing: ${wellbeingIndex} untuk esok hari.`;

    const predId = await savePrediction({ userId, inputBody: input, fitnessScore, wellbeingIndex, sleepRiskLabel, source, recs: allRecs });

    return res.status(201).json({
      status: 'success',
      data: {
        prediction: { id: predId, fitness_score: fitnessScore, wellbeing_index: wellbeingIndex, sleep_risk_label: sleepRiskLabel, overall_level: overallLevel, summary, source, recommendations: allRecs },
      },
    });
  } catch (err) { next(err); }
};

// POST /api/predictions/tips — AI tips via FastAPI
const getTips = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    try {
      const { data } = await mlApi.post('/tips', { prompt: prompt || null });
      return res.json({ status: 'success', data: { tip: data.tip } });
    } catch (_) {
      return res.json({ status: 'success', data: { tip: 'Coba tidur lebih awal 30 menit, matikan layar 1 jam sebelum tidur, dan lakukan relaksasi ringan.' } });
    }
  } catch (err) { next(err); }
};

// GET /api/predictions — history paginated
const getPredictions = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const { data: predictions, count, error } = await supabase
      .from('predictions')
      .select('id, sleep_log_id, predicted_at, fitness_score, wellbeing_index, sleep_risk_label, model_version', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('predicted_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return res.json({
      status: 'success',
      data: {
        predictions,
        pagination: { page, limit, total: count, total_pages: Math.ceil(count / limit) },
      },
    });
  } catch (err) { next(err); }
};

// GET /api/predictions/:id — single with recommendations
const getPrediction = async (req, res, next) => {
  try {
    const { data: pred, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!pred || error) return next(createError('Prediksi tidak ditemukan.', 404));

    const { data: recommendations } = await supabase
      .from('recommendations')
      .select('*')
      .eq('prediction_id', pred.id)
      .order('priority', { ascending: true });

    return res.json({
      status: 'success',
      data: { prediction: { ...pred, recommendations: recommendations || [] } },
    });
  } catch (err) { next(err); }
};

// GET /api/predictions/recommendations/latest
const getLatestRecommendations = async (req, res, next) => {
  try {
    const { data: latest } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', req.user.id)
      .order('predicted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latest) {
      return res.json({ status: 'success', data: { recommendations: [], message: 'Belum ada prediksi. Lakukan konsultasi terlebih dahulu.' } });
    }

    const { data: recs } = await supabase
      .from('recommendations')
      .select('*')
      .eq('prediction_id', latest.id)
      .order('priority', { ascending: true });

    return res.json({ status: 'success', data: { recommendations: recs || [] } });
  } catch (err) { next(err); }
};

module.exports = { predict, consult, getTips, getPredictions, getPrediction, getLatestRecommendations };
