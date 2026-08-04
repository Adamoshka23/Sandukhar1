const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { submissionLimiter } = require('../middleware/rateLimit');
const cartInquiryController = require('../controllers/cartInquiryController');

router.post('/', submissionLimiter, optionalAuth, cartInquiryController.create);

module.exports = router;
