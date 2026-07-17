const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Все маршруты требуют админских прав
router.use(authenticate, requireAdmin);

// ============================================================
// DASHBOARD
// ============================================================
router.get('/dashboard', async (req, res) => {
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

// ============================================================
// PRODUCTS CRUD
// ============================================================
router.post('/products', async (req, res) => {
    try {
        const { slug, sku, nameRu, nameEn, descriptionRu, descriptionEn, price, oldPrice, categoryId, materialId, stock, status, featured, limitedEdition } = req.body;

        if (!slug || !sku || !nameEn || !price) {
            return res.status(400).json({ success: false, message: 'Slug, SKU, name (EN) and price are required' });
        }

        const result = await query(
            `INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, old_price, category_id, material_id, stock, status, featured, limited_edition)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             RETURNING *`,
            [uuidv4(), slug, sku, nameRu || null, nameEn, descriptionRu || null, descriptionEn || null, price, oldPrice || null, categoryId || null, materialId || null, stock || 0, status || 'active', featured || false, limitedEdition || false]
        );

        res.status(201).json({ success: true, data: { product: result.rows[0] } });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'Product with this slug or SKU already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, sku, nameRu, nameEn, descriptionRu, descriptionEn, price, oldPrice, categoryId, materialId, stock, status, featured, limitedEdition } = req.body;

        const result = await query(
            `UPDATE products SET 
                slug = COALESCE($2, slug), sku = COALESCE($3, sku),
                name_ru = COALESCE($4, name_ru), name_en = COALESCE($5, name_en),
                description_ru = COALESCE($6, description_ru), description_en = COALESCE($7, description_en),
                price = COALESCE($8, price), old_price = $9,
                category_id = $10, material_id = $11,
                stock = COALESCE($12, stock), status = COALESCE($13, status),
                featured = COALESCE($14, featured), limited_edition = COALESCE($15, limited_edition)
             WHERE id = $1 RETURNING *`,
            [id, slug, sku, nameRu, nameEn, descriptionRu, descriptionEn, price, oldPrice, categoryId, materialId, stock, status, featured, limitedEdition]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, data: { product: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`UPDATE products SET status = 'archived' WHERE id = $1 RETURNING id`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product archived' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// CATEGORIES CRUD
// ============================================================
router.post('/categories', async (req, res) => {
    try {
        const { slug, nameEn, nameRu, sortOrder } = req.body;
        if (!slug || !nameEn || !nameRu) {
            return res.status(400).json({ success: false, message: 'Slug, name (EN) and name (RU) are required' });
        }
        const result = await query(
            `INSERT INTO categories (id, slug, name_ru, name_en, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [uuidv4(), slug, nameRu, nameEn, sortOrder || 0]
        );
        res.status(201).json({ success: true, data: { category: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, nameEn, nameRu, sortOrder } = req.body;
        const result = await query(
            `UPDATE categories SET slug = COALESCE($2, slug), name_ru = COALESCE($3, name_ru), name_en = COALESCE($4, name_en), sort_order = COALESCE($5, sort_order) WHERE id = $1 RETURNING *`,
            [id, slug, nameRu, nameEn, sortOrder]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: { category: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`DELETE FROM categories WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// MATERIALS CRUD
// ============================================================
router.post('/materials', async (req, res) => {
    try {
        const { slug, nameEn, nameRu, scientificName, sortOrder } = req.body;
        if (!slug || !nameEn || !nameRu) {
            return res.status(400).json({ success: false, message: 'Slug, name (EN) and name (RU) are required' });
        }
        const result = await query(
            `INSERT INTO materials (id, slug, name_ru, name_en, scientific_name, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [uuidv4(), slug, nameRu, nameEn, scientificName || null, sortOrder || 0]
        );
        res.status(201).json({ success: true, data: { material: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/materials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, nameEn, nameRu, scientificName, sortOrder } = req.body;
        const result = await query(
            `UPDATE materials SET slug = COALESCE($2, slug), name_ru = COALESCE($3, name_ru), name_en = COALESCE($4, name_en), scientific_name = COALESCE($5, scientific_name), sort_order = COALESCE($6, sort_order) WHERE id = $1 RETURNING *`,
            [id, slug, nameRu, nameEn, scientificName, sortOrder]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });
        res.json({ success: true, data: { material: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/materials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`DELETE FROM materials WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Material deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// TRANSLATIONS CRUD
// ============================================================
router.post('/translations', async (req, res) => {
    try {
        const { key, locale, value, context } = req.body;
        if (!key || !locale || !value) {
            return res.status(400).json({ success: false, message: 'Key, locale and value are required' });
        }
        const result = await query(
            `INSERT INTO translations (id, key, locale, value, context) VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (key, locale) DO UPDATE SET value = $4, context = $5 RETURNING *`,
            [uuidv4(), key, locale, value, context || null]
        );
        res.status(201).json({ success: true, data: { translation: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/translations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`DELETE FROM translations WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Translation deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;