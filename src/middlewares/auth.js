const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Confere a versão do token contra o banco para permitir revogação
    // (logout, troca de senha e exclusão de conta invalidam tokens antigos).
    const user = await User.findById(payload.id);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    req.user = { id: user._id.toString(), email: user.email };
    req.userDoc = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = auth;
