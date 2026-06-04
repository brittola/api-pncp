const mongoose = require('mongoose');

const connect = async () => {
  mongoose.connection.on('connected', () => console.log('MongoDB conectado.'));
  mongoose.connection.on('error', (err) =>
    console.error('Erro de conexão MongoDB:', err.message));
  mongoose.connection.on('disconnected', () =>
    console.warn('MongoDB desconectado. Tentando reconectar...'));

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
};

module.exports = connect;
