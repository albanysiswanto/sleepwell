'use strict';

/**
 * Centralized error handler middleware.
 * Express calls this when next(err) is used.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const status = statusCode >= 500 ? 'error' : 'fail';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${err.stack}`);
  }

  return res.status(statusCode).json({
    status,
    message: err.message || 'Terjadi kesalahan pada server.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * Helper to create an HTTP error with a status code.
 */
const createError = (message, statusCode = 500) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };
