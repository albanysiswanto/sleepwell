'use strict';

const express = require('express');
const router = express.Router();
const {
  predict, getPredictions, getPrediction, getLatestRecommendations,
} = require('../controllers/prediction.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, predictSchema } = require('../middlewares/validation.middleware');

// All prediction routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/predictions
 * @desc    Submit sleep data for prediction (fitness score + wellbeing index + recommendations)
 *          Tries ML model API first, falls back to rule-based engine.
 * @access  Private
 */
router.post('/', validate(predictSchema), predict);

/**
 * @route   GET /api/predictions
 * @desc    Get prediction history for the current user (paginated)
 * @access  Private
 * @query   page, limit
 */
router.get('/', getPredictions);

/**
 * @route   GET /api/predictions/recommendations/latest
 * @desc    Get latest recommendations for the current user
 * @access  Private
 */
router.get('/recommendations/latest', getLatestRecommendations);

/**
 * @route   GET /api/predictions/:id
 * @desc    Get a single prediction with full details & recommendations
 * @access  Private
 */
router.get('/:id', getPrediction);

module.exports = router;
