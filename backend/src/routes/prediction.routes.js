'use strict';

const express = require('express');
const router = express.Router();
const {
  predict, consult, getTips,
  getPredictions, getPrediction, getLatestRecommendations,
} = require('../controllers/prediction.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, predictSchema } = require('../middlewares/validation.middleware');

// All prediction routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/predictions/consult
 * @desc    Full consultation: ML model (FastAPI /recommend) + rule-based, simpan ke DB
 * @access  Private
 */
router.post('/consult', validate(predictSchema), consult);

/**
 * @route   POST /api/predictions/tips
 * @desc    Get AI sleep tips via FastAPI /tips (Groq LLM)
 * @access  Private
 * @body    { prompt?: string }
 */
router.post('/tips', getTips);

/**
 * @route   POST /api/predictions
 * @desc    Quick predict (fitness score + wellbeing), simpan ke DB
 * @access  Private
 */
router.post('/', validate(predictSchema), predict);

/**
 * @route   GET /api/predictions
 * @desc    Riwayat prediksi user (paginated)
 * @access  Private
 * @query   page, limit
 */
router.get('/', getPredictions);

/**
 * @route   GET /api/predictions/recommendations/latest
 * @desc    Rekomendasi terbaru user
 * @access  Private
 */
router.get('/recommendations/latest', getLatestRecommendations);

/**
 * @route   GET /api/predictions/:id
 * @desc    Detail satu prediksi + rekomendasi
 * @access  Private
 */
router.get('/:id', getPrediction);

module.exports = router;
