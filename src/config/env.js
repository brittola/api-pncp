const required = ['MONGO_URI', 'JWT_SECRET'];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET deve ter no mínimo 32 caracteres.');
  }
};

module.exports = validateEnv;
