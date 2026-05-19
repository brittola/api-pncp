const Contratacao = require('../models/Contratacao');

const LIMIT = 10;

const list = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const skip = (page - 1) * LIMIT;

  const [data, total] = await Promise.all([
    Contratacao.find().skip(skip).limit(LIMIT).lean(),
    Contratacao.countDocuments(),
  ]);

  return res.json({
    data,
    page,
    limit: LIMIT,
    total,
    totalPages: Math.ceil(total / LIMIT),
  });
};

const findById = async (req, res) => {
  const { id } = req.params;

  const data = await Contratacao.findById(id).lean();
  if (!data) {
    return res.status(404).json({ error: 'Contratação não encontrada.' });
  }

  return res.json({ data });
};

module.exports = { list, findById };
