/**
 * ============================================================
 * GALLERY CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');

const galleryController = {
    getAll: async (req, res, next) => {
        try {
            const { category } = req.query;
            const params = [];
            let sql = 'SELECT * FROM gallery_images WHERE is_active = true';

            if (category) {
                params.push(category);
                sql += ` AND category = $${params.length}`;
            }

            sql += ' ORDER BY sort_order';

            const result = await query(sql, params);
            res.status(200).json({ success: true, data: { images: result.rows } });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = galleryController;
