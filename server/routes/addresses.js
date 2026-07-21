const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const addressesController = require('../controllers/addressesController');

router.use(authenticate);
router.get('/', addressesController.getAll);
router.post('/', addressesController.create);
router.put('/:id', addressesController.update);
router.delete('/:id', addressesController.remove);

module.exports = router;
