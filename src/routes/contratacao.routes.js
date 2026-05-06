const { Router } = require('express');
const { query } = require('express-validator');
const { list } = require('../controllers/contratacaoController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

const listRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page deve ser um número inteiro positivo.'),
];

router.get('/', auth, validate(listRules), list);

module.exports = router;
