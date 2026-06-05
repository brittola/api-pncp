const Contratacao = require('../models/Contratacao');
const Alert = require('../models/Alert');

const formatDate = (date) => (date ? date.toISOString().slice(0, 10) : null);

const toResponse = (contratacaoId, alert) => ({
  data: {
    contratacaoId,
    alertDate: formatDate(alert.alertDate),
    alertDone: alert.alertDone,
    savedAt: alert.updatedAt,
  },
});

const updateAlert = async (req, res) => {
  const { id } = req.params;
  const { alertDate, alertDone } = req.body;

  const contratacao = await Contratacao.findById(id).select('_id').lean();
  if (!contratacao) {
    return res.status(404).json({ error: 'Contratação não encontrada.' });
  }

  const set = { alertDate: alertDate ? new Date(alertDate) : null };
  if (alertDone !== undefined) set.alertDone = alertDone;

  const alert = await Alert.findOneAndUpdate(
    { userId: req.user.id, contratacaoId: id },
    { $set: set, $setOnInsert: { userId: req.user.id, contratacaoId: id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return res.json(toResponse(id, alert));
};

module.exports = { updateAlert };
