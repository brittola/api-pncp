const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  // select:false => o hash da senha nunca é retornado por padrão nas consultas.
  senha: { type: String, required: true, select: false },
  cnpj: { type: String, required: true, unique: true, length: 14 },

  // Consentimento LGPD registrado no cadastro.
  consentVersion: { type: String },
  consentAt: { type: Date },

  // Proteção contra força bruta (bloqueio temporário de conta).
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  // Recuperação de senha (token hasheado + expiração).
  resetTokenHash: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false },

  // Revogação de tokens JWT (incrementa no logout / troca de senha / exclusão).
  tokenVersion: { type: Number, default: 0 },

  // Marca contas anonimizadas (direito ao esquecimento — LGPD).
  anonymizedAt: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, BCRYPT_ROUNDS);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.senha);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

userSchema.methods.registerFailedAttempt = async function () {
  // Reseta a janela se o bloqueio anterior já expirou.
  if (this.lockUntil && this.lockUntil.getTime() <= Date.now()) {
    this.failedAttempts = 0;
    this.lockUntil = undefined;
  }

  this.failedAttempts += 1;
  if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }
  await this.save();
};

userSchema.methods.resetLockout = async function () {
  if (this.failedAttempts === 0 && !this.lockUntil) return;
  this.failedAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
