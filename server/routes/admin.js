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
// PRODUCT IMAGES
// ============================================================
const { productUpload } = require('../middleware/upload');

router.post('/products/:id/images', productUpload.array('images', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files || [];

        if (files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }

        const existingCount = await query('SELECT COUNT(*) as count FROM product_images WHERE product_id = $1', [id]);
        const hasPrimary = parseInt(existingCount.rows[0].count) > 0;

        const inserted = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const url = `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;
            const result = await query(
                `INSERT INTO product_images (id, product_id, image_url, sort_order, is_primary)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [uuidv4(), id, url, i, !hasPrimary && i === 0]
            );
            inserted.push(result.rows[0]);
        }

        res.status(201).json({ success: true, data: { images: inserted } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/products/:id/images/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        await query('DELETE FROM product_images WHERE id = $1', [imageId]);
        res.json({ success: true, message: 'Image deleted' });
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

// ============================================================
// ORDERS
// ============================================================
router.get('/orders', async (req, res) => {
    try {
        const result = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
        res.json({ success: true, data: { orders: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await query(`UPDATE orders SET status = $2 WHERE id = $1 RETURNING *`, [id, status]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: { order: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// REVIEWS MODERATION
// ============================================================
router.get('/reviews', async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const result = await query(
            `SELECT r.*, u.email as user_email, p.name_en as product_name
             FROM reviews r JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
             WHERE r.is_approved = $1 ORDER BY r.created_at DESC`,
            [status === 'approved']
        );
        res.json({ success: true, data: { reviews: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/reviews/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`UPDATE reviews SET is_approved = true WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, data: { review: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`DELETE FROM reviews WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// CONTACT ENQUIRIES
// ============================================================
router.get('/contacts', async (req, res) => {
    try {
        const result = await query('SELECT * FROM contact_enquiries ORDER BY created_at DESC LIMIT 200');
        res.json({ success: true, data: { enquiries: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/contacts/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`UPDATE contact_enquiries SET is_read = true WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Enquiry not found' });
        res.json({ success: true, data: { enquiry: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// BESPOKE / TAILORING REQUESTS
// ============================================================
router.get('/tailoring', async (req, res) => {
    try {
        const result = await query('SELECT * FROM tailoring_orders ORDER BY created_at DESC LIMIT 200');
        res.json({ success: true, data: { requests: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/tailoring/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await query(`UPDATE tailoring_orders SET status = $2 WHERE id = $1 RETURNING *`, [id, status]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });
        res.json({ success: true, data: { request: result.rows[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// NEWSLETTER SUBSCRIBERS
// ============================================================
router.get('/newsletter', async (req, res) => {
    try {
        const result = await query('SELECT * FROM newsletter_subscribers WHERE is_active = true ORDER BY subscribed_at DESC');
        res.json({ success: true, data: { subscribers: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// USERS
// ============================================================
router.get('/users', async (req, res) => {
    try {
        const result = await query('SELECT id, email, first_name, last_name, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC LIMIT 200');
        res.json({ success: true, data: { users: result.rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;