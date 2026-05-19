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
];

const findByIdRules = [
  param('id')
    .isMongoId().withMessage('id deve ser um ObjectId válido.'),
];

router.get('/', auth, validate(listRules), list);
router.get('/:id', auth, validate(findByIdRules), findById);

module.exports = router;
