const crypto = require('crypto');
const User = require('../models/User');
const Checklist = require('../models/Checklist');

// LGPD Art. 18 — direito de acesso e portabilidade.
// Retorna todos os dados pessoais do titular (e seus checklists) em JSON.
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const checklists = await Checklist.find({ userId: req.user.id }).lean();

  return res.json({
    usuario: {
      id: user._id,
      nome: user.nome,
      email: user.email,
      cnpj: user.cnpj,
      consentVersion: user.consentVersion,
      consentAt: user.consentAt,
      criadoEm: user.createdAt,
      atualizadoEm: user.updatedAt,
    },
    checklists,
  });
};

// LGPD Art. 18 — direito de retificação. Apenas o próprio nome é editável;
// e-mail e CNPJ são identificadores e exigem fluxo de verificação à parte.
const updateMe = async (req, res) => {
  const { nome } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { nome },
    { new: true }
  ).lean();

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  return res.json({ id: user._id, nome: user.nome, email: user.email });
};

// LGPD Art. 18 — direito ao esquecimento.
// Anonimiza os dados pessoais (preservando integridade referencial e dados
// estatísticos) e invalida os tokens do usuário. Os checklists são removidos.
const deleteMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('+senha');
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const anon = crypto.randomBytes(8).toString('hex');
  user.nome = 'Usuário removido';
  user.email = `anon-${anon}@removido.local`;
  user.cnpj = `00000000${anon.slice(0, 6)}`.slice(0, 14);
  user.senha = crypto.randomBytes(32).toString('hex'); // hash irreversível ao salvar
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  user.tokenVersion += 1; // invalida tokens
  user.anonymizedAt = new Date();
  await user.save();

  await Checklist.deleteMany({ userId: req.user.id });

  return res.json({ message: 'Conta anonimizada e dados pessoais removidos.' });
};

module.exports = { getMe, updateMe, deleteMe };
