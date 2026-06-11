const { Router } = require('express');
const { body } = require('express-validator');
const { getMe, updateMe, deleteMe } = require('../controllers/userController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = Router();

const updateMeRules = [
  body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório.'),
];

router.get('/me', auth, getMe);
router.put('/me', auth, validate(updateMeRules), updateMe);
router.delete('/me', auth, deleteMe);

module.exports = router;
