'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { createError } = require('../middlewares/error.middleware');

// ── Create Sleep Log ──────────────────────────────────────────
const createLog = (req, res, next) => {
  try {
    const {
      log_date,
      sleep_duration,
      sleep_quality,
      stress_level,
      physical_activity,
      total_steps = 0,
      calories_burned = 0,
      very_active_minutes = 0,
      sedentary_minutes = 0,
      bmi_category = 'Normal',
      sleep_disorder = 'None',
      heart_rate,
      notes,
    } = req.body;

    const id = uuidv4();

    db.prepare(`
      INSERT INTO sleep_logs (
        id, user_id, log_date, sleep_duration, sleep_quality, stress_level,
        physical_activity, total_steps, calories_burned, very_active_minutes,
        sedentary_minutes, bmi_category, sleep_disorder, heart_rate, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, log_date, sleep_duration, sleep_quality, stress_level,
      physical_activity, total_steps, calories_burned, very_active_minutes,
      sedentary_minutes, bmi_category, sleep_disorder, heart_rate || null, notes || null
    );

    const created = db.prepare('SELECT * FROM sleep_logs WHERE id = ?').get(id);

    return res.status(201).json({
      status: 'success',
      message: 'Log tidur berhasil disimpan.',
      data: { sleep_log: created },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get All Logs (paginated) ──────────────────────────────────
const getLogs = (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const { from, to } = req.query;
    let where = 'user_id = ?';
    const params = [req.user.id];

    if (from) { where += ' AND log_date >= ?'; params.push(from); }
    if (to)   { where += ' AND log_date <= ?'; params.push(to); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM sleep_logs WHERE ${where}`).get(...params).count;
    const logs  = db.prepare(`SELECT * FROM sleep_logs WHERE ${where} ORDER BY log_date DESC LIMIT ? OFFSET ?`)
                    .all(...params, limit, offset);

    return res.json({
      status: 'success',
      data: {
        sleep_logs: logs,
        pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Single Log ────────────────────────────────────────────
const getLog = (req, res, next) => {
  try {
    const log = db
      .prepare('SELECT * FROM sleep_logs WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!log) return next(createError('Log tidur tidak ditemukan.', 404));

    return res.json({ status: 'success', data: { sleep_log: log } });
  } catch (err) {
    next(err);
  }
};

// ── Update Log ────────────────────────────────────────────────
const updateLog = (req, res, next) => {
  try {
    const log = db
      .prepare('SELECT id FROM sleep_logs WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!log) return next(createError('Log tidur tidak ditemukan.', 404));

    const {
      log_date, sleep_duration, sleep_quality, stress_level,
      physical_activity, total_steps, calories_burned,
      very_active_minutes, sedentary_minutes, bmi_category,
      sleep_disorder, heart_rate, notes,
    } = req.body;

    db.prepare(`
      UPDATE sleep_logs SET
        log_date = ?, sleep_duration = ?, sleep_quality = ?, stress_level = ?,
        physical_activity = ?, total_steps = ?, calories_burned = ?,
        very_active_minutes = ?, sedentary_minutes = ?, bmi_category = ?,
        sleep_disorder = ?, heart_rate = ?, notes = ?
      WHERE id = ?
    `).run(
      log_date, sleep_duration, sleep_quality, stress_level,
      physical_activity, total_steps ?? 0, calories_burned ?? 0,
      very_active_minutes ?? 0, sedentary_minutes ?? 0,
      bmi_category ?? 'Normal', sleep_disorder ?? 'None',
      heart_rate ?? null, notes ?? null,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM sleep_logs WHERE id = ?').get(req.params.id);
    return res.json({ status: 'success', message: 'Log tidur berhasil diperbarui.', data: { sleep_log: updated } });
  } catch (err) {
    next(err);
  }
};

// ── Delete Log ────────────────────────────────────────────────
const deleteLog = (req, res, next) => {
  try {
    const info = db
      .prepare('DELETE FROM sleep_logs WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    if (info.changes === 0) return next(createError('Log tidur tidak ditemukan.', 404));

    return res.json({ status: 'success', message: 'Log tidur berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};

// ── Summary / Statistics ──────────────────────────────────────
const getSummary = (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;

    const stats = db.prepare(`
      SELECT
        COUNT(*)                        AS total_logs,
        ROUND(AVG(sleep_duration), 2)   AS avg_sleep_duration,
        ROUND(AVG(sleep_quality), 2)    AS avg_sleep_quality,
        ROUND(AVG(stress_level), 2)     AS avg_stress_level,
        ROUND(AVG(physical_activity), 2) AS avg_physical_activity,
        ROUND(AVG(total_steps), 0)      AS avg_total_steps,
        MIN(sleep_duration)             AS min_sleep_duration,
        MAX(sleep_duration)             AS max_sleep_duration
      FROM sleep_logs
      WHERE user_id = ?
        AND log_date >= date('now', ? || ' days')
    `).get(userId, `-${days}`);

    const disorder_distribution = db.prepare(`
      SELECT sleep_disorder, COUNT(*) AS count
      FROM sleep_logs
      WHERE user_id = ?
        AND log_date >= date('now', ? || ' days')
      GROUP BY sleep_disorder
    `).all(userId, `-${days}`);

    const quality_trend = db.prepare(`
      SELECT log_date, sleep_quality, sleep_duration, stress_level
      FROM sleep_logs
      WHERE user_id = ?
        AND log_date >= date('now', ? || ' days')
      ORDER BY log_date ASC
    `).all(userId, `-${days}`);

    return res.json({
      status: 'success',
      data: {
        period_days: parseInt(days),
        stats,
        disorder_distribution,
        quality_trend,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLog, getLogs, getLog, updateLog, deleteLog, getSummary };
