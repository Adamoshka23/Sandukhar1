/**
 * ============================================================
 * MATERIALS CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');

const materialsController = {
    getAll: async (req, res, next) => {
        try {
            const result = await query('SELECT * FROM materials WHERE is_active = true ORDER BY sort_order');
            res.status(200).json({ success: true, data: { materials: result.rows } });
        } catch (error) {
            next(error);
        }
    },

    getBySlug: async (req, res, next) => {
        try {
            const { slug } = req.params;
            const result = await query('SELECT * FROM materials WHERE slug = $1 AND is_active = true', [slug]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Material not found.' });
            }

            res.status(200).json({ success: true, data: { material: result.rows[0] } });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = materialsController;
