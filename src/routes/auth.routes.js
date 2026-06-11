const { Router } = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/authController');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const validateCnpj = require('../utils/cnpj');

const router = Router();

const strongPassword = (field) =>
  body(field)
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      `${field} deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.`
    );

const registerRules = [
  body('nome').notEmpty().withMessage('Nome é obrigatório.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  strongPassword('senha'),
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

const changePasswordRules = [
  body('senhaAtual').notEmpty().withMessage('Senha atual é obrigatória.'),
  strongPassword('novaSenha'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('E-mail inválido.'),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Token é obrigatório.'),
  strongPassword('novaSenha'),
];

router.post('/register', validate(registerRules), register);
router.post('/login', validate(loginRules), login);
router.post('/forgot-password', validate(forgotPasswordRules), forgotPassword);
router.post('/reset-password', validate(resetPasswordRules), resetPassword);
router.post('/change-password', auth, validate(changePasswordRules), changePassword);
router.post('/logout', auth, logout);

module.exports = router;
