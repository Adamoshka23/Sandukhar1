/**
 * ============================================================
 * PRODUCTS ROUTES
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Public routes
router.get('/', productsController.getAll);
router.get('/:slug', productsController.getBySlug);

module.exports = router;