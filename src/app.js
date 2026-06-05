require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const connect = require('./config/db');
const swaggerSpec = require('./config/swagger');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const contratacaoRoutes = require('./routes/contratacao.routes');
const meRoutes = require('./routes/me.routes');

const app = express();

app.use(express.json());

app.use(cors());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/contratacoes', contratacaoRoutes);
app.use('/me', meRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;

connect().then(() => {
  app.listen(PORT);
});
