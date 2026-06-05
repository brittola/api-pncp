const { Router } = require('express');
const { listSaved } = require('../controllers/savedOpportunityController');
const auth = require('../middlewares/auth');

const router = Router();

router.get('/saved-opportunities', auth, listSaved);

module.exports = router;
