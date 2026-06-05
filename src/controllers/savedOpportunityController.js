const Contratacao = require('../models/Contratacao');
const SavedOpportunity = require('../models/SavedOpportunity');

const formatDate = (date) => (date ? date.toISOString().slice(0, 10) : null);

const toResponse = (contratacaoId, saved) => ({
  data: {
    contratacaoId,
    alertDate: formatDate(saved.alertDate),
    alertDone: saved.alertDone,
    savedAt: saved.createdAt,
  },
});

const save = async (req, res) => {
  const { id } = req.params;

  const contratacao = await Contratacao.findById(id).select('_id').lean();
  if (!contratacao) {
    return res.status(404).json({ error: 'Contratação não encontrada.' });
  }

  const existing = await SavedOpportunity.findOne({ userId: req.user.id, contratacaoId: id }).lean();
  if (existing) {
    return res.status(200).json(toResponse(id, existing));
  }

  const saved = await SavedOpportunity.create({ userId: req.user.id, contratacaoId: id });
  return res.status(201).json(toResponse(id, saved));
};

const remove = async (req, res) => {
  const { id } = req.params;

  const deleted = await SavedOpportunity.findOneAndDelete({ userId: req.user.id, contratacaoId: id });
  if (!deleted) {
    return res.status(404).json({ error: 'Edital não está salvo para este usuário.' });
  }

  return res.status(204).send();
};

const listSaved = async (req, res) => {
  const saved = await SavedOpportunity.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const ids = saved.map((s) => s.contratacaoId);
  const contratacoes = await Contratacao.find({ _id: { $in: ids } }).lean();
  const byId = new Map(contratacoes.map((c) => [String(c._id), c]));

  const data = saved.map((s) => ({
    contratacaoId: s.contratacaoId,
    contratacao: byId.get(String(s.contratacaoId)) || null,
    alertDate: formatDate(s.alertDate),
    alertDone: s.alertDone,
    savedAt: s.createdAt,
  }));

  return res.json({ data });
};

const updateAlert = async (req, res) => {
  const { id } = req.params;
  const { alertDate, alertDone } = req.body;

  const set = { alertDate: alertDate ? new Date(alertDate) : null };
  if (alertDone !== undefined) set.alertDone = alertDone;

  const saved = await SavedOpportunity.findOneAndUpdate(
    { userId: req.user.id, contratacaoId: id },
    { $set: set },
    { new: true }
  ).lean();

  if (!saved) {
    return res.status(404).json({ error: 'Edital não está salvo para este usuário.' });
  }

  return res.json(toResponse(id, saved));
};

module.exports = { save, remove, listSaved, updateAlert };
