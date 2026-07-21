const express = require('express');
const router = express.Router();
const translationsController = require('../controllers/translationsController');

router.get('/all', translationsController.getAll);
router.get('/', translationsController.getByLocale);

module.exports = router;
