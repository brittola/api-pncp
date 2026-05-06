const mongoose = require('mongoose');

const contratacaoSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Contratacao', contratacaoSchema, 'contratacoes');
