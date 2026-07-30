const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { submissionLimiter } = require('../middleware/rateLimit');
const tailoringController = require('../controllers/tailoringController');

router.post('/', submissionLimiter, optionalAuth, tailoringController.create);

module.exports = router;
