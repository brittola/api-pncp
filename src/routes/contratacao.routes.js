const { Router } = require('express');
const { query, param, body } = require('express-validator');
const { list, findById } = require('../controllers/contratacaoController');
const { getChecklist, updateChecklist } = require('../controllers/checklistController');
const { save, remove, updateAlert } = require('../controllers/savedOpportunityController');
const CHECKLIST_ITEMS = require('../constants/checklistItems');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

const listRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page deve ser um número inteiro positivo.'),
  query('uf')
    .optional()
    .isString().isLength({ min: 2, max: 2 }).withMessage('uf deve ter 2 caracteres.'),
  query('valorMin')
    .optional()
    .isFloat({ min: 0 }).withMessage('valorMin deve ser um número >= 0.'),
  query('valorMax')
    .optional()
    .isFloat({ min: 0 }).withMessage('valorMax deve ser um número >= 0.'),
  query('q')
    .optional()
    .isString().isLength({ min: 1, max: 200 }).withMessage('q deve ter entre 1 e 200 caracteres.'),
  query('modalidade')
    .optional()
    .isInt({ min: 1 }).withMessage('modalidade deve ser um inteiro positivo.'),
  query('ano')
    .optional()
    .isInt({ min: 2000, max: 2100 }).withMessage('ano deve estar entre 2000 e 2100.'),
  query('situacao')
    .optional()
    .isInt({ min: 1 }).withMessage('situacao deve ser um inteiro positivo.'),
  query('dataPublicacaoInicio')
    .optional()
    .isISO8601().withMessage('dataPublicacaoInicio deve estar em formato ISO 8601 (YYYY-MM-DD).'),
  query('dataPublicacaoFim')
    .optional()
    .isISO8601().withMessage('dataPublicacaoFim deve estar em formato ISO 8601 (YYYY-MM-DD).'),
];

const findByIdRules = [
  param('id')
    .isMongoId().withMessage('id deve ser um ObjectId válido.'),
];

const checklistIdRules = [
  param('id')
    .isMongoId().withMessage('id deve ser um ObjectId válido.'),
];

const updateChecklistRules = [
  param('id')
    .isMongoId().withMessage('id deve ser um ObjectId válido.'),
  body('items')
    .isArray({ min: 1 }).withMessage('items deve ser um array não vazio.'),
  body('items.*.key')
    .isIn(CHECKLIST_ITEMS).withMessage('key inválida.'),
  body('items.*.checked')
    .isBoolean().withMessage('checked deve ser booleano.'),
];

const updateAlertRules = [
  param('id')
    .isMongoId().withMessage('id deve ser um ObjectId válido.'),
  body('alertDate')
    .exists().withMessage('alertDate é obrigatório (use null para limpar).')
    .bail()
    .custom((value) => {
      if (value === null) return true;
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      return !Number.isNaN(Date.parse(value));
    }).withMessage('alertDate deve ser uma data YYYY-MM-DD ou null.'),
  body('alertDone')
    .optional()
    .isBoolean().withMessage('alertDone deve ser booleano.'),
];

router.get('/', auth, validate(listRules), list);
router.get('/:id', auth, validate(findByIdRules), findById);
router.get('/:id/checklist', auth, validate(checklistIdRules), getChecklist);
router.put('/:id/checklist', auth, validate(updateChecklistRules), updateChecklist);
router.post('/:id/save', auth, validate(findByIdRules), save);
router.delete('/:id/save', auth, validate(findByIdRules), remove);
router.patch('/:id/alert', auth, validate(updateAlertRules), updateAlert);

module.exports = router;
