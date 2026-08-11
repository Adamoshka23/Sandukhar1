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

// Suggests the next SKU in the "SD-XXX-NNN" sequence, scanning every
// product regardless of status so archived/draft SKUs aren't reused.
router.get('/products/next-sku', async (req, res) => {
    try {
        const result = await query('SELECT sku FROM products');
        const nextNumber = result.rows.reduce((max, row) => {
            const match = /-(\d+)$/.exec(row.sku || '');
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0) + 1;
        res.json({ success: true, data: { sku: `SD-XXX-${String(nextNumber).padStart(3, '0')}` } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        const {
            slug, sku, nameRu, nameEn, descriptionRu, descriptionEn,
            shortDescriptionRu, shortDescriptionEn,
            price, oldPrice, categoryId, materialId, stock, status, featured,
            madeToOrder, colors, sizes, hardwareOptions, specifications
        } = req.body;

        if (!slug || !sku || !nameEn || !price) {
            return res.status(400).json({ success: false, message: 'Slug, SKU, name (EN) and price are required' });
        }

        const result = await query(
            `INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en,
                short_description_ru, short_description_en,
                price, old_price, category_id, material_id, stock, status, featured,
                made_to_order, colors, sizes, hardware_options, specifications)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
             RETURNING *`,
            [
                uuidv4(), slug, sku, nameRu || null, nameEn, descriptionRu || null, descriptionEn || null,
                shortDescriptionRu || null, shortDescriptionEn || null,
                price, oldPrice || null, categoryId || null, materialId || null, stock || 0, status || 'active', featured || false,
                madeToOrder || false, JSON.stringify(colors || []), JSON.stringify(sizes || []),
                JSON.stringify(hardwareOptions || []), JSON.stringify(specifications || [])
            ]
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
        const {
            slug, sku, nameRu, nameEn, descriptionRu, descriptionEn,
            shortDescriptionRu, shortDescriptionEn,
            price, oldPrice, categoryId, materialId, stock, status, featured,
            madeToOrder, colors, sizes, hardwareOptions, specifications
        } = req.body;

        const result = await query(
            `UPDATE products SET
                slug = COALESCE($2, slug), sku = COALESCE($3, sku),
                name_ru = COALESCE($4, name_ru), name_en = COALESCE($5, name_en),
                description_ru = COALESCE($6, description_ru), description_en = COALESCE($7, description_en),
                short_description_ru = COALESCE($8, short_description_ru), short_description_en = COALESCE($9, short_description_en),
                price = COALESCE($10, price), old_price = $11,
                category_id = $12, material_id = $13,
                stock = COALESCE($14, stock), status = COALESCE($15, status),
                featured = COALESCE($16, featured),
                made_to_order = COALESCE($17, made_to_order),
                colors = COALESCE($18, colors), sizes = COALESCE($19, sizes),
                hardware_options = COALESCE($20, hardware_options), specifications = COALESCE($21, specifications)
             WHERE id = $1 RETURNING *`,
            [
                id, slug, sku, nameRu, nameEn, descriptionRu, descriptionEn,
                shortDescriptionRu, shortDescriptionEn,
                price, oldPrice, categoryId, materialId, stock, status, featured,
                madeToOrder, colors ? JSON.stringify(colors) : null, sizes ? JSON.stringify(sizes) : null,
                hardwareOptions ? JSON.stringify(hardwareOptions) : null, specifications ? JSON.stringify(specifications) : null
            ]
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

// Body: { order: [imageId, ...] } — persists the gallery's on-screen order
// by writing each image's index in the array to sort_order.
router.patch('/products/:id/images/reorder', async (req, res) => {
    try {
        const { id } = req.params;
        const { order } = req.body;
        if (!Array.isArray(order) || order.length === 0) {
            return res.status(400).json({ success: false, message: 'order must be a non-empty array of image ids' });
        }
        await Promise.all(order.map((imageId, index) =>
            query('UPDATE product_images SET sort_order = $1 WHERE id = $2 AND product_id = $3', [index, imageId, id])
        ));
        res.json({ success: true, message: 'Image order updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/products/:id/images/:imageId/primary', async (req, res) => {
    try {
        const { id, imageId } = req.params;
        const result = await query(
            'UPDATE product_images SET is_primary = (id = $1) WHERE product_id = $2 RETURNING id',
            [imageId, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Product has no images' });
        res.json({ success: true, message: 'Primary image updated' });
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
// A category can only nest one level deep — if the requested parent is
// itself already a subcategory, reject rather than silently creating a
// grandchild the storefront filter tree can't display.
async function assertValidParent(parentId, ownId) {
    if (!parentId) return null;
    if (parentId === ownId) {
        return 'A category cannot be its own parent.';
    }
    const result = await query('SELECT parent_id FROM categories WHERE id = $1', [parentId]);
    if (result.rows.length === 0) {
        return 'Parent category not found.';
    }
    if (result.rows[0].parent_id) {
        return 'The chosen parent is itself a subcategory — only top-level categories can be a parent.';
    }
    return null;
}

router.post('/categories', async (req, res) => {
    try {
        const { slug, nameEn, nameRu, sortOrder, parentId } = req.body;
        if (!slug || !nameEn || !nameRu) {
            return res.status(400).json({ success: false, message: 'Slug, name (EN) and name (RU) are required' });
        }
        const parentError = await assertValidParent(parentId || null, null);
        if (parentError) return res.status(400).json({ success: false, message: parentError });

        const result = await query(
            `INSERT INTO categories (id, slug, name_ru, name_en, sort_order, parent_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [uuidv4(), slug, nameRu, nameEn, sortOrder || 0, parentId || null]
        );
        res.status(201).json({ success: true, data: { category: result.rows[0] } });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'A category with this slug already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, nameEn, nameRu, sortOrder, parentId } = req.body;
        const parentError = await assertValidParent(parentId || null, id);
        if (parentError) return res.status(400).json({ success: false, message: parentError });

        const result = await query(
            `UPDATE categories SET slug = COALESCE($2, slug), name_ru = COALESCE($3, name_ru), name_en = COALESCE($4, name_en), sort_order = COALESCE($5, sort_order), parent_id = $6 WHERE id = $1 RETURNING *`,
            [id, slug, nameRu, nameEn, sortOrder, parentId || null]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: { category: result.rows[0] } });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'A category with this slug already exists' });
        }
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