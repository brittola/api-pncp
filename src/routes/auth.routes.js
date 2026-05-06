const { Router } = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const validate = require('../middlewares/validate');
const validateCnpj = require('../utils/cnpj');

const router = Router();

const registerRules = [
  body('nome').notEmpty().withMessage('Nome é obrigatório.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
  body('cnpj')
    .isLength({ min: 14, max: 14 }).withMessage('CNPJ deve ter 14 dígitos.')
    .isNumeric().withMessage('CNPJ deve conter apenas números.')
    .custom((val) => {
      if (!validateCnpj(val)) throw new Error('CNPJ inválido.');
      return true;
    }),
];

const loginRules = [
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').notEmpty().withMessage('Senha é obrigatória.'),
];

router.post('/register', validate(registerRules), register);
router.post('/login', validate(loginRules), login);

module.exports = router;
