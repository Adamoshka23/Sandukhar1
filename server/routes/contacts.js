const express = require('express');
const router = express.Router();
const { submissionLimiter } = require('../middleware/rateLimit');
const contactsController = require('../controllers/contactsController');

router.post('/', submissionLimiter, contactsController.create);

module.exports = router;
