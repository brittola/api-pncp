const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contratacaoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contratacao', required: true },
  checkedKeys: { type: [String], default: [] },
}, { timestamps: true });

checklistSchema.index({ userId: 1, contratacaoId: 1 }, { unique: true });

module.exports = mongoose.model('Checklist', checklistSchema);
