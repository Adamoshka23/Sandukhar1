const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');

router.post('/', contactsController.create);

module.exports = router;
