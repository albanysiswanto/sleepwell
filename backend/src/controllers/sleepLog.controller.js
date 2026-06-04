'use strict';

const { v4: uuidv4 } = require('uuid');
const supabase = require('../database/db');
const { createError } = require('../middlewares/error.middleware');

// ── Create Sleep Log ──────────────────────────────────────────
const createLog = async (req, res, next) => {
  try {
    const {
      log_date, sleep_duration, sleep_quality, stress_level,
      physical_activity, total_steps = 0, calories_burned = 0,
      very_active_minutes = 0, sedentary_minutes = 0,
      bmi_category = 'Normal', sleep_disorder = 'None',
      heart_rate, notes,
    } = req.body;

    const id = uuidv4();
    const { data, error } = await supabase.from('sleep_logs').insert({
      id, user_id: req.user.id, log_date,
      sleep_duration, sleep_quality, stress_level, physical_activity,
      total_steps, calories_burned, very_active_minutes, sedentary_minutes,
      bmi_category, sleep_disorder,
      heart_rate: heart_rate || null,
      notes: notes || null,
    }).select().single();

    if (error) throw new Error(error.message);

    return res.status(201).json({
      status: 'success',
      message: 'Log tidur berhasil disimpan.',
      data: { sleep_log: data },
    });
  } catch (err) { next(err); }
};

// ── Get All Logs (paginated) ──────────────────────────────────
const getLogs = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    let query = supabase
      .from('sleep_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('log_date', { ascending: false })
      .range(from, to);

    if (req.query.from) query = query.gte('log_date', req.query.from);
    if (req.query.to)   query = query.lte('log_date', req.query.to);

    const { data: logs, count, error } = await query;
    if (error) throw new Error(error.message);

    return res.json({
      status: 'success',
      data: {
        sleep_logs: logs,
        pagination: { page, limit, total: count, total_pages: Math.ceil(count / limit) },
      },
    });
  } catch (err) { next(err); }
};

// ── Get Single Log ────────────────────────────────────────────
const getLog = async (req, res, next) => {
  try {
    const { data: log, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!log || error) return next(createError('Log tidur tidak ditemukan.', 404));
    return res.json({ status: 'success', data: { sleep_log: log } });
  } catch (err) { next(err); }
};

// ── Update Log ────────────────────────────────────────────────
const updateLog = async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('sleep_logs').select('id').eq('id', req.params.id).eq('user_id', req.user.id).maybeSingle();
    if (!existing) return next(createError('Log tidur tidak ditemukan.', 404));

    const {
      log_date, sleep_duration, sleep_quality, stress_level,
      physical_activity, total_steps, calories_burned,
      very_active_minutes, sedentary_minutes, bmi_category,
      sleep_disorder, heart_rate, notes,
    } = req.body;

    const { data, error } = await supabase
      .from('sleep_logs')
      .update({
        log_date, sleep_duration, sleep_quality, stress_level, physical_activity,
        total_steps: total_steps ?? 0, calories_burned: calories_burned ?? 0,
        very_active_minutes: very_active_minutes ?? 0, sedentary_minutes: sedentary_minutes ?? 0,
        bmi_category: bmi_category ?? 'Normal', sleep_disorder: sleep_disorder ?? 'None',
        heart_rate: heart_rate ?? null, notes: notes ?? null,
      })
      .eq('id', req.params.id)
      .select().single();

    if (error) throw new Error(error.message);
    return res.json({ status: 'success', message: 'Log tidur berhasil diperbarui.', data: { sleep_log: data } });
  } catch (err) { next(err); }
};

// ── Delete Log ────────────────────────────────────────────────
const deleteLog = async (req, res, next) => {
  try {
    const { error, count } = await supabase
      .from('sleep_logs')
      .delete({ count: 'exact' })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error || count === 0) return next(createError('Log tidur tidak ditemukan.', 404));
    return res.json({ status: 'success', message: 'Log tidur berhasil dihapus.' });
  } catch (err) { next(err); }
};

// ── Summary / Statistics ──────────────────────────────────────
const getSummary = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const { data: logs, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('log_date', sinceStr)
      .order('log_date', { ascending: true });

    if (error) throw new Error(error.message);

    const total = logs.length;
    const avg = (key) => total ? parseFloat((logs.reduce((s, l) => s + (l[key] || 0), 0) / total).toFixed(2)) : null;

    const stats = {
      total_logs: total,
      avg_sleep_duration:     avg('sleep_duration'),
      avg_sleep_quality:      avg('sleep_quality'),
      avg_stress_level:       avg('stress_level'),
      avg_physical_activity:  avg('physical_activity'),
      avg_total_steps:        avg('total_steps'),
      min_sleep_duration:     total ? Math.min(...logs.map(l => l.sleep_duration)) : null,
      max_sleep_duration:     total ? Math.max(...logs.map(l => l.sleep_duration)) : null,
    };

    // Disorder distribution
    const disorderMap = {};
    logs.forEach(l => { disorderMap[l.sleep_disorder] = (disorderMap[l.sleep_disorder] || 0) + 1; });
    const disorder_distribution = Object.entries(disorderMap).map(([sleep_disorder, count]) => ({ sleep_disorder, count }));

    const quality_trend = logs.map(l => ({
      log_date: l.log_date, sleep_quality: l.sleep_quality,
      sleep_duration: l.sleep_duration, stress_level: l.stress_level,
    }));

    return res.json({
      status: 'success',
      data: { period_days: days, stats, disorder_distribution, quality_trend },
    });
  } catch (err) { next(err); }
};

module.exports = { createLog, getLogs, getLog, updateLog, deleteLog, getSummary };
