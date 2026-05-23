'use strict';

const express = require('express');
const router = express.Router();
const { getToken, decrementToken } = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/token', authenticate, getToken);
router.post('/token/decrement', authenticate, decrementToken);

module.exports = router;
