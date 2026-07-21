const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const tailoringController = require('../controllers/tailoringController');

router.post('/', optionalAuth, tailoringController.create);

module.exports = router;
