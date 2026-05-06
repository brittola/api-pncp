const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senha: { type: String, required: true },
  cnpj: { type: String, required: true, length: 14 },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, 10);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.senha);
};

module.exports = mongoose.model('User', userSchema);
