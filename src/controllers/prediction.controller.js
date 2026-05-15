'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { createError } = require('../middlewares/error.middleware');

// ── Rule-based recommendation engine ─────────────────────────
// (Used as fallback when ML model is not available)

const FITNESS_WEIGHT = {
  sleep_duration:    0.30,
  sleep_quality:     0.25,
  stress_level:     -0.20,  // negative impact
  physical_activity: 0.15,
  total_steps:       0.10,
};

const WELLBEING_WEIGHT = {
  sleep_quality:     0.30,
  sleep_duration:    0.25,
  stress_level:     -0.25,
  physical_activity: 0.20,
};

/**
 * Normalize a value to 0-1 range given min/max.
 */
const normalize = (val, min, max) => Math.min(1, Math.max(0, (val - min) / (max - min)));

/**
 * Calculate fitness score (0-100) from input features.
 */
const calcFitnessScore = (input) => {
  const norm = {
    sleep_duration:    normalize(input.sleep_duration, 3, 10),
    sleep_quality:     normalize(input.sleep_quality, 1, 10),
    stress_level:      normalize(input.stress_level, 1, 10),
    physical_activity: normalize(input.physical_activity, 0, 120),
    total_steps:       normalize(input.total_steps || 0, 0, 20000),
  };

  let score = 50; // base
  Object.entries(FITNESS_WEIGHT).forEach(([key, weight]) => {
    score += weight * norm[key] * 50;
  });
  return Math.round(Math.min(100, Math.max(0, score)) * 10) / 10;
};

/**
 * Calculate wellbeing index (0-100).
 */
const calcWellbeingIndex = (input) => {
  const norm = {
    sleep_quality:     normalize(input.sleep_quality, 1, 10),
    sleep_duration:    normalize(input.sleep_duration, 3, 10),
    stress_level:      normalize(input.stress_level, 1, 10),
    physical_activity: normalize(input.physical_activity, 0, 120),
  };

  let index = 50;
  Object.entries(WELLBEING_WEIGHT).forEach(([key, weight]) => {
    index += weight * norm[key] * 50;
  });
  return Math.round(Math.min(100, Math.max(0, index)) * 10) / 10;
};

/**
 * Determine sleep risk label.
 */
const getSleepRiskLabel = (input) => {
  if (input.sleep_duration < 5 || input.sleep_quality <= 3) return 'High Risk';
  if (input.sleep_duration < 6.5 || input.sleep_quality <= 5) return 'Moderate Risk';
  return 'Low Risk';
};

/**
 * Generate rule-based recommendations.
 */
const generateRecommendations = (input, fitnessScore, wellbeingIndex) => {
  const recs = [];

  if (input.sleep_duration < 7) {
    recs.push({
      category: 'sleep_duration',
      priority: 'high',
      message: 'Durasi tidur Anda kurang dari 7 jam. Kurang tidur dapat menurunkan konsentrasi dan imunitas.',
      action: 'Coba tidur 30 menit lebih awal malam ini dan pertahankan jadwal tidur yang konsisten.',
    });
  } else if (input.sleep_duration > 9) {
    recs.push({
      category: 'sleep_duration',
      priority: 'medium',
      message: 'Durasi tidur Anda lebih dari 9 jam. Tidur berlebihan bisa berhubungan dengan kelelahan kronis.',
      action: 'Evaluasi apakah Anda merasa segar saat bangun. Konsultasikan dengan dokter jika berlanjut.',
    });
  }

  if (input.sleep_quality <= 4) {
    recs.push({
      category: 'sleep_quality',
      priority: 'high',
      message: 'Kualitas tidur Anda sangat rendah. Ini dapat mempengaruhi produktivitas dan kesehatan mental.',
      action: 'Hindari penggunaan layar 1 jam sebelum tidur. Pastikan kamar gelap, sejuk, dan tenang.',
    });
  }

  if (input.stress_level >= 7) {
    recs.push({
      category: 'stress',
      priority: 'high',
      message: 'Tingkat stres Anda sangat tinggi dan berpotensi mengganggu kualitas tidur.',
      action: 'Coba teknik relaksasi: meditasi 10 menit, pernapasan dalam, atau journaling sebelum tidur.',
    });
  } else if (input.stress_level >= 5) {
    recs.push({
      category: 'stress',
      priority: 'medium',
      message: 'Tingkat stres Anda moderat. Manajemen stres yang baik dapat meningkatkan kualitas tidur.',
      action: 'Jadwalkan waktu istirahat di siang hari dan kurangi beban pekerjaan mendekati waktu tidur.',
    });
  }

  if (input.physical_activity < 30) {
    recs.push({
      category: 'physical_activity',
      priority: input.physical_activity < 10 ? 'high' : 'medium',
      message: 'Aktivitas fisik Anda masih kurang. Olahraga teratur dapat meningkatkan kualitas tidur secara signifikan.',
      action: 'Mulai dengan 20-30 menit jalan kaki setiap hari. Hindari olahraga intens 3 jam sebelum tidur.',
    });
  }

  if ((input.total_steps || 0) < 5000) {
    recs.push({
      category: 'steps',
      priority: 'low',
      message: 'Jumlah langkah harian Anda kurang dari 5.000. WHO merekomendasikan minimal 7.000-8.000 langkah/hari.',
      action: 'Gunakan tangga daripada lift. Berjalan saat istirahat makan siang.',
    });
  }

  if (fitnessScore < 40) {
    recs.push({
      category: 'overall',
      priority: 'high',
      message: 'Skor kebugaran Anda rendah. Diperlukan perbaikan menyeluruh pada pola tidur dan aktivitas.',
      action: 'Prioritaskan tidur cukup, kurangi stres, dan tambah aktivitas fisik secara bertahap.',
    });
  } else if (fitnessScore >= 75) {
    recs.push({
      category: 'overall',
      priority: 'low',
      message: 'Skor kebugaran Anda baik! Pertahankan kebiasaan positif yang sudah Anda jalani.',
      action: 'Pantau terus pola tidur Anda dan jaga konsistensinya.',
    });
  }

  return recs;
};

// ── Predict Endpoint ──────────────────────────────────────────
const predict = async (req, res, next) => {
  try {
    const input = req.body;
    const userId = req.user.id;

    let fitnessScore, wellbeingIndex, sleepRiskLabel, source;

    // Try ML API first
    const ML_API_URL = process.env.ML_API_URL;
    try {
      const { default: fetch } = await import('node-fetch');
      const mlRes = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(5000),
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        fitnessScore  = mlData.fitness_score;
        wellbeingIndex = mlData.wellbeing_index;
        sleepRiskLabel = mlData.sleep_risk_label;
        source = 'ml_model';
      } else {
        throw new Error('ML API returned non-OK status');
      }
    } catch (_mlErr) {
      // Fallback to rule-based calculation
      fitnessScore   = calcFitnessScore(input);
      wellbeingIndex = calcWellbeingIndex(input);
      sleepRiskLabel = getSleepRiskLabel(input);
      source = 'rule_based';
    }

    const recommendations = generateRecommendations(input, fitnessScore, wellbeingIndex);

    // Persist prediction
    const predId = uuidv4();
    db.prepare(`
      INSERT INTO predictions (id, user_id, sleep_log_id, fitness_score, wellbeing_index, sleep_risk_label, model_version, input_snapshot, recommendation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      predId, userId,
      input.sleep_log_id || null,
      fitnessScore, wellbeingIndex, sleepRiskLabel,
      source === 'ml_model' ? 'ml-1.0' : 'rule-based-1.0',
      JSON.stringify(input),
      JSON.stringify(recommendations)
    );

    // Persist individual recommendations
    const insertRec = db.prepare(`
      INSERT INTO recommendations (id, user_id, prediction_id, category, priority, message, action)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    recommendations.forEach((r) => {
      insertRec.run(uuidv4(), userId, predId, r.category, r.priority, r.message, r.action);
    });

    return res.status(201).json({
      status: 'success',
      data: {
        prediction: {
          id: predId,
          fitness_score: fitnessScore,
          wellbeing_index: wellbeingIndex,
          sleep_risk_label: sleepRiskLabel,
          source,
          recommendations,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Prediction History ────────────────────────────────────
const getPredictions = (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) AS count FROM predictions WHERE user_id = ?').get(req.user.id).count;
    const predictions = db.prepare(`
      SELECT id, sleep_log_id, predicted_at, fitness_score, wellbeing_index, sleep_risk_label, model_version
      FROM predictions WHERE user_id = ?
      ORDER BY predicted_at DESC LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    return res.json({
      status: 'success',
      data: {
        predictions,
        pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Single Prediction ─────────────────────────────────────
const getPrediction = (req, res, next) => {
  try {
    const pred = db
      .prepare('SELECT * FROM predictions WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!pred) return next(createError('Prediksi tidak ditemukan.', 404));

    const recommendations = db
      .prepare('SELECT * FROM recommendations WHERE prediction_id = ? ORDER BY priority DESC')
      .all(pred.id);

    return res.json({
      status: 'success',
      data: {
        prediction: {
          ...pred,
          input_snapshot: JSON.parse(pred.input_snapshot || '{}'),
          recommendations,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Latest Recommendations ────────────────────────────────
const getLatestRecommendations = (req, res, next) => {
  try {
    const latestPred = db
      .prepare('SELECT id FROM predictions WHERE user_id = ? ORDER BY predicted_at DESC LIMIT 1')
      .get(req.user.id);

    if (!latestPred) {
      return res.json({
        status: 'success',
        data: { recommendations: [], message: 'Belum ada prediksi. Lakukan analisis tidur terlebih dahulu.' },
      });
    }

    const recs = db
      .prepare('SELECT * FROM recommendations WHERE prediction_id = ? ORDER BY priority DESC')
      .all(latestPred.id);

    return res.json({ status: 'success', data: { recommendations: recs } });
  } catch (err) {
    next(err);
  }
};

module.exports = { predict, getPredictions, getPrediction, getLatestRecommendations };
