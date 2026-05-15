'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');

// Route imports
const authRoutes       = require('./routes/auth.routes');
const sleepLogRoutes   = require('./routes/sleepLog.routes');
const predictionRoutes = require('./routes/prediction.routes');

const app = express();

// ── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',   // React dev server
    'http://localhost:5173',   // Vite dev server
    'http://localhost:8501',   // Streamlit dev server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (dev only) ───────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Health Check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SleepWell AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/sleep-logs',  sleepLogRoutes);
app.use('/api/predictions', predictionRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Endpoint tidak ditemukan.',
  });
});

// ── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
