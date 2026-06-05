const mongoose = require('mongoose');

const savedOpportunitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contratacaoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contratacao', required: true },
  alertDate: { type: Date, default: null },
  alertDone: { type: Boolean, default: false },
}, { timestamps: true });

savedOpportunitySchema.index({ userId: 1, contratacaoId: 1 }, { unique: true });

module.exports = mongoose.model('SavedOpportunity', savedOpportunitySchema);
