const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/materialsController');

router.get('/', materialsController.getAll);
router.get('/:slug', materialsController.getBySlug);

module.exports = router;
