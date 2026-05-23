'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../database/db');
const { createError } = require('../middlewares/error.middleware');

// ── Register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, age, weight, occupation, gender } = req.body;

    // Cek duplikat email
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) return next(createError('Email sudah terdaftar.', 409));

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const { error } = await supabase.from('users').insert({
      id, name, email,
      password: hashedPassword,
      age: age || null,
      weight: weight || null,
      occupation: occupation || null,
      gender: gender || null,
    });

    if (error) throw new Error(error.message);

    return res.status(201).json({
      status: 'success',
      message: 'Akun berhasil dibuat.',
      data: { id, name, email },
    });
  } catch (err) { next(err); }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(createError('Email atau password salah.', 401));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      status: 'success',
      message: 'Login berhasil.',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (err) { next(err); }
};

// ── Get Profile ───────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, age, weight, occupation, gender, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!user || error) return next(createError('Pengguna tidak ditemukan.', 404));

    return res.json({ status: 'success', data: { user } });
  } catch (err) { next(err); }
};

// ── Update Profile ────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, age, weight, occupation, gender } = req.body;

    const { error } = await supabase
      .from('users')
      .update({ name, age: age || null, weight: weight || null, occupation: occupation || null, gender: gender || null, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (error) throw new Error(error.message);

    return res.json({ status: 'success', message: 'Profil berhasil diperbarui.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile, updateProfile };
