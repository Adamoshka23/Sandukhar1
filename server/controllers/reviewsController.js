/**
 * ============================================================
 * REVIEWS CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const reviewsController = {
    /**
     * GET /api/reviews?productId=
     */
    getForProduct: async (req, res, next) => {
        try {
            const { productId, locale = 'en' } = req.query;

            if (!productId) {
                return res.status(400).json({ success: false, message: 'productId is required.' });
            }

            const result = await query(`
                SELECT r.id, r.rating, r.title_${locale} as title, r.content_${locale} as content,
                       r.is_verified, r.created_at, u.first_name, u.last_name
                FROM reviews r
                JOIN users u ON u.id = r.user_id
                WHERE r.product_id = $1 AND r.is_approved = true
                ORDER BY r.created_at DESC
            `, [productId]);

            const summary = await query(
                'SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as average FROM reviews WHERE product_id = $1 AND is_approved = true',
                [productId]
            );

            res.status(200).json({
                success: true,
                data: {
                    reviews: result.rows,
                    summary: {
                        count: parseInt(summary.rows[0].count),
                        average: parseFloat(summary.rows[0].average)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/reviews
     */
    create: async (req, res, next) => {
        try {
            const { productId, orderId, rating, title, content } = req.body;

            if (!productId || !rating) {
                return res.status(400).json({ success: false, message: 'productId and rating are required.' });
            }
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
            }

            const result = await query(`
                INSERT INTO reviews (id, user_id, product_id, order_id, rating, title_en, content_en)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [uuidv4(), req.user.id, productId, orderId || null, rating, title || null, content || null]);

            res.status(201).json({
                success: true,
                message: 'Review submitted and pending approval.',
                data: { review: result.rows[0] }
            });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
            }
            next(error);
        }
    }
};

module.exports = reviewsController;
