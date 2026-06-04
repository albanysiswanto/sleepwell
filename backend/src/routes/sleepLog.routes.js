'use strict';

const express = require('express');
const router = express.Router();
const {
  createLog, getLogs, getLog, updateLog, deleteLog, getSummary,
} = require('../controllers/sleepLog.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, sleepLogSchema } = require('../middlewares/validation.middleware');

// All sleep log routes require authentication
router.use(authenticate);

/**
 * @route   GET  /api/sleep-logs/summary
 * @desc    Get sleep summary statistics for the current user
 * @access  Private
 * @query   days (default 30)
 */
router.get('/summary', getSummary);

/**
 * @route   GET  /api/sleep-logs
 * @desc    Get all sleep logs (paginated, filterable by date)
 * @access  Private
 * @query   page, limit, from (YYYY-MM-DD), to (YYYY-MM-DD)
 */
router.get('/', getLogs);

/**
 * @route   POST /api/sleep-logs
 * @desc    Create a new sleep log entry
 * @access  Private
 */
router.post('/', validate(sleepLogSchema), createLog);

/**
 * @route   GET  /api/sleep-logs/:id
 * @desc    Get a single sleep log by ID
 * @access  Private
 */
router.get('/:id', getLog);

/**
 * @route   PUT  /api/sleep-logs/:id
 * @desc    Update a sleep log by ID
 * @access  Private
 */
router.put('/:id', validate(sleepLogSchema), updateLog);

/**
 * @route   DELETE /api/sleep-logs/:id
 * @desc    Delete a sleep log by ID
 * @access  Private
 */
router.delete('/:id', deleteLog);

module.exports = router;
