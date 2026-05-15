'use strict';

const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, registerSchema, loginSchema } = require('../middlewares/validation.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login and get JWT token
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update logged-in user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

module.exports = router;
