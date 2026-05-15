'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { createError } = require('../middlewares/error.middleware');

// ── Register ──────────────────────────────────────────────────
const register = (req, res, next) => {
  try {
    const { name, email, password, age, gender } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return next(createError('Email sudah terdaftar.', 409));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password, age, gender)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, hashedPassword, age || null, gender || null);

    return res.status(201).json({
      status: 'success',
      message: 'Akun berhasil dibuat.',
      data: { id, name, email },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────
const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
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
  } catch (err) {
    next(err);
  }
};

// ── Get Profile ───────────────────────────────────────────────
const getProfile = (req, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, name, email, age, gender, created_at FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) return next(createError('Pengguna tidak ditemukan.', 404));

    return res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

// ── Update Profile ────────────────────────────────────────────
const updateProfile = (req, res, next) => {
  try {
    const { name, age, gender } = req.body;
    db.prepare(`
      UPDATE users SET name = ?, age = ?, gender = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, age || null, gender || null, req.user.id);

    return res.json({ status: 'success', message: 'Profil berhasil diperbarui.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile };
