/**
 * ============================================================
 * API ROUTES — MAIN ROUTER
 * ============================================================
 */

const express = require('express');
const router = express.Router();

const productsRoutes = require('./products');
const categoriesRoutes = require('./categories');
const materialsRoutes = require('./materials');
const usersRoutes = require('./users');
const authRoutes = require('./auth');
const ordersRoutes = require('./orders');
const wishlistRoutes = require('./wishlist');
const translationsRoutes = require('./translations');
const galleryRoutes = require('./gallery');
const reviewsRoutes = require('./reviews');
const addressesRoutes = require('./addresses');
const tailoringRoutes = require('./tailoring');
const contactsRoutes = require('./contacts');
const newsletterRoutes = require('./newsletter');
const faqRoutes = require('./faq');
const adminRoutes = require('./admin');

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/materials', materialsRoutes);
router.use('/translations', translationsRoutes);
router.use('/gallery', galleryRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/contacts', contactsRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/faq', faqRoutes);

// Protected routes (require authentication)
router.use('/users', usersRoutes);
router.use('/orders', ordersRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/addresses', addressesRoutes);
router.use('/tailoring', tailoringRoutes);

// Admin routes
router.use('/admin', adminRoutes);

module.exports = router;