const { Router } = require('express');
const { query, param } = require('express-validator');
const { list, findById } = require('../controllers/contratacaoController');
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

router.get('/', auth, validate(listRules), list);
router.get('/:id', auth, validate(findByIdRules), findById);

module.exports = router;
