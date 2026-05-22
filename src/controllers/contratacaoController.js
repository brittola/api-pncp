const Contratacao = require('../models/Contratacao');

const LIMIT = 10;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = ({
  uf,
  valorMin,
  valorMax,
  q,
  modalidade,
  ano,
  situacao,
  dataPublicacaoInicio,
  dataPublicacaoFim,
}) => {
  const filter = {};

  if (uf) {
    filter['unidadeOrgao.ufSigla'] = uf.toUpperCase();
  }

  if (valorMin !== undefined || valorMax !== undefined) {
    filter.valorTotalEstimado = {};
    if (valorMin !== undefined) filter.valorTotalEstimado.$gte = Number(valorMin);
    if (valorMax !== undefined) filter.valorTotalEstimado.$lte = Number(valorMax);
  }

  if (q) {
    filter.objetoCompra = { $regex: escapeRegex(q), $options: 'i' };
  }

  if (modalidade !== undefined) {
    filter.modalidadeId = Number(modalidade);
  }

  if (ano !== undefined) {
    filter.anoCompra = Number(ano);
  }

  if (situacao !== undefined) {
    filter.situacaoCompraId = Number(situacao);
  }

  if (dataPublicacaoInicio || dataPublicacaoFim) {
    filter.dataPublicacaoPncp = {};
    if (dataPublicacaoInicio) filter.dataPublicacaoPncp.$gte = dataPublicacaoInicio;
    if (dataPublicacaoFim) filter.dataPublicacaoPncp.$lte = dataPublicacaoFim;
  }

  return filter;
};

const list = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const skip = (page - 1) * LIMIT;

  const filter = buildFilter(req.query);

  const [data, total] = await Promise.all([
    Contratacao.find(filter).skip(skip).limit(LIMIT).lean(),
    Contratacao.countDocuments(filter),
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
