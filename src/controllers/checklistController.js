const Contratacao = require('../models/Contratacao');
const Checklist = require('../models/Checklist');
const CHECKLIST_ITEMS = require('../constants/checklistItems');

const toResponse = (checkedKeys) => ({
  items: CHECKLIST_ITEMS.map((key) => ({ key, checked: checkedKeys.includes(key) })),
});

const getChecklist = async (req, res) => {
  const { id } = req.params;

  const contratacao = await Contratacao.findById(id).select('_id').lean();
  if (!contratacao) {
    return res.status(404).json({ error: 'Contratação não encontrada.' });
  }

  const checklist = await Checklist.findOneAndUpdate(
    { userId: req.user.id, contratacaoId: id },
    { $setOnInsert: { userId: req.user.id, contratacaoId: id } },
    { new: true, upsert: true }
  ).lean();

  return res.json(toResponse(checklist.checkedKeys));
};

const updateChecklist = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;

  const contratacao = await Contratacao.findById(id).select('_id').lean();
  if (!contratacao) {
    return res.status(404).json({ error: 'Contratação não encontrada.' });
  }

  let checklist = await Checklist.findOne({ userId: req.user.id, contratacaoId: id });
  if (!checklist) {
    checklist = new Checklist({ userId: req.user.id, contratacaoId: id });
  }

  const checked = new Set(checklist.checkedKeys);
  for (const { key, checked: isChecked } of items) {
    if (isChecked) checked.add(key);
    else checked.delete(key);
  }
  checklist.checkedKeys = CHECKLIST_ITEMS.filter((key) => checked.has(key));
  await checklist.save();

  return res.json(toResponse(checklist.checkedKeys));
};

module.exports = { getChecklist, updateChecklist };
