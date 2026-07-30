const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { submissionLimiter } = require('../middleware/rateLimit');
const ordersController = require('../controllers/ordersController');

router.get('/track/:orderNumber', ordersController.track);
router.post('/', submissionLimiter, optionalAuth, ordersController.create);
router.get('/', authenticate, ordersController.getMine);

module.exports = router;
