const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const CONSENT_VERSION = '1.0';
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const register = async (req, res) => {
  const { nome, email, senha, cnpj } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { cnpj }] });
  if (exists) {
    return res.status(409).json({ error: 'E-mail ou CNPJ já cadastrado.' });
  }

  const user = await User.create({
    nome,
    email,
    senha,
    cnpj,
    consentVersion: CONSENT_VERSION,
    consentAt: new Date(),
  });

  return res.status(201).json({ id: user._id, nome: user.nome, email: user.email });
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  const user = await User.findOne({ email }).select('+senha');
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  if (user.isLocked()) {
    return res.status(429).json({
      error: 'Conta temporariamente bloqueada por excesso de tentativas. Tente mais tarde.',
    });
  }

  const match = await user.comparePassword(senha);
  if (!match) {
    await user.registerFailedAttempt();
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  await user.resetLockout();

  return res.json({ token: signToken(user) });
};

const changePassword = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  const user = await User.findById(req.user.id).select('+senha');
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const match = await user.comparePassword(senhaAtual);
  if (!match) {
    return res.status(401).json({ error: 'Senha atual incorreta.' });
  }

  user.senha = novaSenha;
  user.tokenVersion += 1;
  await user.save();

  return res.json({ message: 'Senha alterada com sucesso. Faça login novamente.' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericResponse = {
    message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.',
  };

  const user = await User.findOne({ email });
  if (!user) {
    return res.json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = hashToken(rawToken);
  user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const response = { ...genericResponse };
  if (process.env.NODE_ENV !== 'production') {
    response.resetToken = rawToken;
  }
  return res.json(response);
};

const resetPassword = async (req, res) => {
  const { token, novaSenha } = req.body;

  const user = await User.findOne({
    resetTokenHash: hashToken(token),
    resetTokenExpires: { $gt: new Date() },
  }).select('+senha');

  if (!user) {
    return res.status(400).json({ error: 'Token inválido ou expirado.' });
  }

  user.senha = novaSenha;
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  user.tokenVersion += 1;
  user.failedAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  return res.json({ message: 'Senha redefinida com sucesso. Faça login novamente.' });
};

const logout = async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
  return res.json({ message: 'Logout efetuado.' });
};

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};
