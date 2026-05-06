const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  const { nome, email, senha, cnpj } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: 'E-mail já cadastrado.' });
  }

  const user = await User.create({ nome, email, senha, cnpj });

  return res.status(201).json({ id: user._id, nome: user.nome, email: user.email });
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const match = await user.comparePassword(senha);
  if (!match) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({ token });
};

module.exports = { register, login };
