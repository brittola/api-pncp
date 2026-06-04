const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senha: { type: String, required: true, select: false },
  cnpj: { type: String, required: true, unique: true, length: 14 },

  consentVersion: { type: String },
  consentAt: { type: Date },

  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  resetTokenHash: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false },

  tokenVersion: { type: Number, default: 0 },

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
