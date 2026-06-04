'use strict';

const Joi = require('joi');

// ── Auth ──────────────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().integer().min(1).max(120).optional(),
  weight: Joi.number().min(20).max(300).optional(),
  occupation: Joi.string().max(100).optional().allow(''),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Sleep Log ─────────────────────────────────────────────────
const sleepLogSchema = Joi.object({
  log_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ 'string.pattern.base': 'log_date harus berformat YYYY-MM-DD' }),
  sleep_duration: Joi.number().min(0).max(24).required(),
  sleep_quality: Joi.number().integer().min(1).max(10).required(),
  stress_level: Joi.number().integer().min(1).max(10).required(),
  physical_activity: Joi.number().integer().min(0).required(),
  total_steps: Joi.number().integer().min(0).optional(),
  calories_burned: Joi.number().min(0).optional(),
  very_active_minutes: Joi.number().integer().min(0).optional(),
  sedentary_minutes: Joi.number().integer().min(0).optional(),
  bmi_category: Joi.string().valid('Underweight', 'Normal', 'Overweight', 'Obese').optional(),
  sleep_disorder: Joi.string().optional(),
  heart_rate: Joi.number().min(20).max(300).optional(),
  notes: Joi.string().max(500).optional().allow(''),
});

// ── Prediction / Inference ────────────────────────────────────
const predictSchema = Joi.object({
  sleep_duration: Joi.number().min(0).max(24).required(),
  sleep_quality: Joi.number().integer().min(1).max(10).required(),
  stress_level: Joi.number().integer().min(1).max(10).required(),
  physical_activity: Joi.number().integer().min(0).required(),
  total_steps: Joi.number().integer().min(0).optional().default(0),
  calories_burned: Joi.number().min(0).optional().default(0),
  very_active_minutes: Joi.number().integer().min(0).optional().default(0),
  sedentary_minutes: Joi.number().integer().min(0).optional().default(0),
  bmi_category: Joi.string().valid('Underweight', 'Normal', 'Overweight', 'Obese').optional().default('Normal'),
  sleep_disorder: Joi.string().optional(),
  heart_rate: Joi.number().min(20).max(300).optional(),
  sleep_log_id: Joi.string().optional(),
  model_type: Joi.string().optional(),
});

/**
 * Factory to create a Joi validation middleware.
 * @param {Joi.Schema} schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validasi gagal',
      errors: error.details.map((d) => d.message),
    });
  }
  req.body = value; // replace body with coerced values
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  sleepLogSchema,
  predictSchema,
};
