const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const wishlistController = require('../controllers/wishlistController');

router.use(authenticate);
router.get('/', wishlistController.getAll);
router.post('/toggle', wishlistController.toggle);

module.exports = router;
