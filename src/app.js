require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

const validateEnv = require('./config/env');
const connect = require('./config/db');
const swaggerSpec = require('./config/swagger');
const sanitize = require('./middlewares/sanitize');
const { globalLimiter, authLimiter } = require('./middlewares/rateLimit');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const contratacaoRoutes = require('./routes/contratacao.routes');

// Falha cedo se a configuração de segurança estiver incompleta.
validateEnv();

const app = express();

// Cabeçalhos de segurança (XSS, clickjacking, no-sniff, HSTS, etc.).
app.use(helmet());

// CORS restrito às origens autorizadas (lista separada por vírgula no env).
// Sem CORS_ORIGINS definido, libera tudo apenas fora de produção.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // ferramentas server-to-server
    if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS.'));
  },
}));

// Limita o tamanho do corpo da requisição (anti-DoS por payload grande).
app.use(express.json({ limit: '10kb' }));

// Remove operadores NoSQL/dot-notation de body e params.
app.use(sanitize);

// Log de requisições (sem corpo, para não registrar PII).
app.use(morgan('combined'));

// Rate limit global.
app.use(globalLimiter);

// Health check para monitoramento/continuidade de operação.
app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    db: dbUp ? 'up' : 'down',
    uptime: process.uptime(),
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limit estrito nas rotas de autenticação.
app.use('/auth', authLimiter, authRoutes);
app.use('/users', userRoutes);
app.use('/contratacoes', contratacaoRoutes);

// Handler de erro genérico — não vaza stack trace.
app.use((err, req, res, next) => {
  if (err && err.message === 'Origem não permitida pelo CORS.') {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;

connect().then(() => {
  const server = app.listen(PORT, () => console.log(`API ouvindo na porta ${PORT}.`));

  // Graceful shutdown: encerra conexões em andamento e fecha o banco.
  const shutdown = async (signal) => {
    console.log(`Recebido ${signal}. Encerrando...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    // Força saída se não encerrar em 10s.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}).catch((err) => {
  console.error('Falha ao iniciar a aplicação:', err.message);
  process.exit(1);
});
