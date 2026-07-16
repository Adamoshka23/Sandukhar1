/**
 * ============================================================
 * ADMIN ROUTES
 * Protected routes for admin panel
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { productUpload, categoryUpload, galleryUpload, materialUpload } = require('../middleware/upload');
const productsController = require('../controllers/productsController');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Products management
router.post('/products', productUpload.array('images', 10), productsController.create);
router.put('/products/:id', productsController.update);
router.delete('/products/:id', productsController.remove);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
    const { query } = require('../config/database');
    try {
        const [products, orders, users, revenue] = await Promise.all([
            query('SELECT COUNT(*) as count FROM products WHERE status = $1', ['active']),
            query('SELECT COUNT(*) as count FROM orders'),
            query('SELECT COUNT(*) as count FROM users'),
            query('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != $1', ['cancelled'])
        ]);

        res.json({
            success: true,
            data: {
                totalProducts: parseInt(products.rows[0].count),
                totalOrders: parseInt(orders.rows[0].count),
                totalUsers: parseInt(users.rows[0].count),
                totalRevenue: parseFloat(revenue.rows[0].total)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;