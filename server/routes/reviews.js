const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reviewsController = require('../controllers/reviewsController');

router.get('/', reviewsController.getForProduct);
router.post('/', authenticate, reviewsController.create);

module.exports = router;
