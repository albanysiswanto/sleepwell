'use strict';

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid atau sudah kedaluwarsa.',
    });
  }
};

module.exports = { authenticate };
