/**
 * ============================================================
 * PRODUCTS CONTROLLER
 * ============================================================
 */

const { query, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const productsController = {
    /**
     * GET /api/products
     * List all active products with optional filters
     */
    getAll: async (req, res, next) => {
        try {
            const {
                category, material, featured, search,
                sort = 'created_at', order = 'DESC',
                page = 1, limit = 12,
                locale = 'en'
            } = req.query;

            let sql = `
                SELECT p.*,
                       c.slug as category_slug,
                       c.name_${locale} as category_name,
                       m.slug as material_slug,
                       m.name_${locale} as material_name,
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'id', pi.id,
                                   'url', pi.image_url,
                                   'thumbnail', pi.thumbnail_url,
                                   'alt', pi.alt_text_${locale},
                                   'isPrimary', pi.is_primary
                               ) ORDER BY pi.sort_order
                           ) FILTER (WHERE pi.id IS NOT NULL),
                           '[]'::json
                       ) as images
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN materials m ON p.material_id = m.id
                LEFT JOIN product_images pi ON p.id = pi.product_id
                WHERE p.status = 'active'
            `;

            const params = [];
            let paramCount = 0;

            if (category) {
                paramCount++;
                sql += ` AND c.slug = $${paramCount}`;
                params.push(category);
            }

            if (material) {
                paramCount++;
                sql += ` AND m.slug = $${paramCount}`;
                params.push(material);
            }

            if (featured === 'true') {
                sql += ` AND p.featured = true`;
            }

            if (search) {
                paramCount++;
                sql += ` AND (p.name_${locale} ILIKE $${paramCount} OR p.description_${locale} ILIKE $${paramCount})`;
                params.push(`%${search}%`);
            }

            sql += ` GROUP BY p.id, c.slug, c.name_${locale}, m.slug, m.name_${locale}`;

            // Sorting
            const allowedSorts = ['price', 'created_at', 'name_en', 'name_ru'];
            const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            sql += ` ORDER BY p.${sortColumn} ${sortOrder}`;

            // Pagination
            const offset = (parseInt(page) - 1) * parseInt(limit);
            paramCount++;
            sql += ` LIMIT $${paramCount}`;
            params.push(parseInt(limit));
            paramCount++;
            sql += ` OFFSET $${paramCount}`;
            params.push(offset);

            // Count total
            let countSql = `
                SELECT COUNT(DISTINCT p.id) as total
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN materials m ON p.material_id = m.id
                WHERE p.status = 'active'
            `;
            const countParams = [];
            let countParamCount = 0;

            if (category) {
                countParamCount++;
                countSql += ` AND c.slug = $${countParamCount}`;
                countParams.push(category);
            }
            if (material) {
                countParamCount++;
                countSql += ` AND m.slug = $${countParamCount}`;
                countParams.push(material);
            }
            if (search) {
                countParamCount++;
                countSql += ` AND (p.name_${locale} ILIKE $${countParamCount} OR p.description_${locale} ILIKE $${countParamCount})`;
                countParams.push(`%${search}%`);
            }

            const [productsResult, countResult] = await Promise.all([
                query(sql, params),
                query(countSql, countParams)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    products: productsResult.rows,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit)),
                        totalItems: parseInt(countResult.rows[0].total),
                        itemsPerPage: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/products/:slug
     * Get single product by slug
     */
    getBySlug: async (req, res, next) => {
        try {
            const { slug } = req.params;
            const { locale = 'en' } = req.query;

            const result = await query(`
                SELECT p.*,
                       c.slug as category_slug,
                       c.name_${locale} as category_name,
                       m.slug as material_slug,
                       m.name_${locale} as material_name,
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'id', pi.id, 'url', pi.image_url,
                                   'thumbnail', pi.thumbnail_url,
                                   'alt', pi.alt_text_${locale},
                                   'isPrimary', pi.is_primary
                               ) ORDER BY pi.sort_order
                           ) FILTER (WHERE pi.id IS NOT NULL),
                           '[]'::json
                       ) as images,
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'id', pv.id, 'url', pv.video_url,
                                   'poster', pv.poster_url,
                                   'title', pv.title_${locale}
                               ) ORDER BY pv.sort_order
                           ) FILTER (WHERE pv.id IS NOT NULL),
                           '[]'::json
                       ) as videos
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN materials m ON p.material_id = m.id
                LEFT JOIN product_images pi ON p.id = pi.product_id
                LEFT JOIN product_videos pv ON p.id = pv.product_id
                WHERE p.slug = $1 AND p.status = 'active'
                GROUP BY p.id, c.slug, c.name_${locale}, m.slug, m.name_${locale}
            `, [slug]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found.'
                });
            }

            res.status(200).json({
                success: true,
                data: { product: result.rows[0] }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/products
     * Create new product (admin only)
     */
    create: async (req, res, next) => {
        const client = await getClient();
        try {
            await client.query('BEGIN');

            const {
                slug, sku, nameRu, nameEn, descriptionRu, descriptionEn,
                shortDescriptionRu, shortDescriptionEn,
                price, oldPrice, categoryId, materialId,
                stock, status, featured, limitedEdition, madeToOrder,
                colors, sizes, hardwareOptions, specifications
            } = req.body;

            const result = await client.query(`
                INSERT INTO products (id, slug, sku, name_ru, name_en,
                    description_ru, description_en, short_description_ru, short_description_en,
                    price, old_price, category_id, material_id,
                    stock, status, featured, limited_edition, made_to_order,
                    colors, sizes, hardware_options, specifications)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                RETURNING *
            `, [
                uuidv4(), slug, sku, nameRu, nameEn,
                descriptionRu, descriptionEn, shortDescriptionRu, shortDescriptionEn,
                price, oldPrice, categoryId, materialId,
                stock || 0, status || 'active', featured || false, limitedEdition || false, madeToOrder || false,
                JSON.stringify(colors || []), JSON.stringify(sizes || []),
                JSON.stringify(hardwareOptions || []), JSON.stringify(specifications || [])
            ]);

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Product created successfully.',
                data: { product: result.rows[0] }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    /**
     * PUT /api/admin/products/:id
     * Update product (admin only)
     */
    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Build dynamic UPDATE query
            const allowedFields = [
                'slug', 'sku', 'name_ru', 'name_en', 'description_ru', 'description_en',
                'price', 'old_price', 'category_id', 'material_id',
                'stock', 'status', 'featured', 'limited_edition', 'made_to_order'
            ];

            const setClauses = [];
            const params = [id];
            let paramCount = 1;

            for (const [key, value] of Object.entries(updates)) {
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (allowedFields.includes(dbKey)) {
                    paramCount++;
                    setClauses.push(`${dbKey} = $${paramCount}`);
                    params.push(value);
                }
            }

            if (setClauses.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update.'
                });
            }

            const result = await query(
                `UPDATE products SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
                params
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product updated successfully.',
                data: { product: result.rows[0] }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/admin/products/:id
     * Soft delete product (admin only)
     */
    remove: async (req, res, next) => {
        try {
            const { id } = req.params;

            const result = await query(
                `UPDATE products SET status = 'archived' WHERE id = $1 RETURNING id`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product archived successfully.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = productsController;