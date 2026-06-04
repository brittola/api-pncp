const rateLimit = require('express-rate-limit');

// Limite global de requisições por IP — mitiga DoS e abuso.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

// Limite estrito para autenticação — mitiga força bruta de credenciais.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

module.exports = { globalLimiter, authLimiter };
