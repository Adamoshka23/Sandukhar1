/**
 * ============================================================
 * WISHLIST CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const wishlistController = {
    /**
     * GET /api/wishlist
     */
    getAll: async (req, res, next) => {
        try {
            const { locale = 'en' } = req.query;
            const result = await query(`
                SELECT w.id as wishlist_id, w.created_at as added_at, p.*,
                       COALESCE(
                           json_agg(
                               json_build_object('url', pi.image_url, 'isPrimary', pi.is_primary)
                               ORDER BY pi.sort_order
                           ) FILTER (WHERE pi.id IS NOT NULL), '[]'::json
                       ) as images
                FROM wishlists w
                JOIN products p ON p.id = w.product_id
                LEFT JOIN product_images pi ON pi.product_id = p.id
                WHERE w.user_id = $1
                GROUP BY w.id, p.id
                ORDER BY w.created_at DESC
            `, [req.user.id]);

            res.status(200).json({ success: true, data: { items: result.rows } });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/wishlist/toggle { productId }
     */
    toggle: async (req, res, next) => {
        try {
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({ success: false, message: 'productId is required.' });
            }

            const existing = await query(
                'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
                [req.user.id, productId]
            );

            if (existing.rows.length > 0) {
                await query('DELETE FROM wishlists WHERE id = $1', [existing.rows[0].id]);
                return res.status(200).json({ success: true, data: { added: false } });
            }

            await query(
                'INSERT INTO wishlists (id, user_id, product_id) VALUES ($1, $2, $3)',
                [uuidv4(), req.user.id, productId]
            );

            res.status(200).json({ success: true, data: { added: true } });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = wishlistController;
