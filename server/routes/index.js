const express = require('express');
const router = express.Router();

const productsRoutes = require('./products');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/admin', adminRoutes);

// Простые маршруты для категорий и материалов (без отдельных контроллеров)
router.get('/categories', async (req, res) => {
    const { query } = require('../config/database');
    try {
        const result = await query('SELECT * FROM categories WHERE is_active = true ORDER BY sort_order');
        res.json({ success: true, data: { categories: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/materials', async (req, res) => {
    const { query } = require('../config/database');
    try {
        const result = await query('SELECT * FROM materials WHERE is_active = true ORDER BY sort_order');
        res.json({ success: true, data: { materials: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/translations/all', async (req, res) => {
    const { query } = require('../config/database');
    try {
        const result = await query('SELECT * FROM translations ORDER BY key, locale');
        res.json({ success: true, data: { translations: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/translations', async (req, res) => {
    const { query } = require('../config/database');
    try {
        const { locale = 'en' } = req.query;
        const result = await query('SELECT * FROM translations WHERE locale = $1 ORDER BY key', [locale]);
        res.json({ success: true, data: { translations: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Заказы (заглушка)
router.get('/orders', async (req, res) => {
    res.json({ success: true, data: { orders: [] } });
});

module.exports = router;