'use strict';

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       SleepWell AI — RESTful API Server      ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Listening on  : http://localhost:${PORT}         ║`);
  console.log(`║  Environment   : ${(process.env.NODE_ENV || 'development').padEnd(26)}║`);
  console.log('║  Health check  : GET /health                 ║');
  console.log('╚══════════════════════════════════════════════╝');
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
