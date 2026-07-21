const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

router.use(authenticate);
router.patch('/me', usersController.updateMe);
router.patch('/me/password', usersController.changePassword);

module.exports = router;
