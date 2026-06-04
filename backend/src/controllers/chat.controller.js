'use strict';

const supabase = require('../database/db');
const { createError } = require('../middlewares/error.middleware');

// Ambil token dari database
const getToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Fetch data token user
    const { data, error } = await supabase
      .from('users')
      .select('chat_tokens, last_token_reset')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    let tokens = data?.chat_tokens ?? 5;
    let lastReset = data?.last_token_reset;

    // Logika Lazy Reset: Jika last_token_reset bukan hari ini, reset ke 5
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = lastReset ? new Date(lastReset).toISOString().split('T')[0] : null;

    if (lastResetDate !== today) {
      tokens = 5;
      await supabase
        .from('users')
        .update({ chat_tokens: 5, last_token_reset: new Date().toISOString() })
        .eq('id', userId);
    }

    return res.json({ status: 'success', data: { tokensLeft: tokens } });
  } catch (err) {
    next(err);
  }
};

// Kurangi token saat user mengirim chat
const decrementToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Pastikan mendapatkan token terbaru
    const { data, error } = await supabase
      .from('users')
      .select('chat_tokens')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    let tokens = data?.chat_tokens ?? 5;
    
    if (tokens <= 0) {
      return next(createError('Token habis. Sesi konsultasi selesai untuk hari ini.', 403));
    }

    // Kurangi token
    const newTokens = tokens - 1;
    await supabase
      .from('users')
      .update({ chat_tokens: newTokens })
      .eq('id', userId);

    return res.json({ status: 'success', data: { tokensLeft: newTokens } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getToken, decrementToken };
