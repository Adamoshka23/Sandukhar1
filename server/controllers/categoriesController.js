/**
 * ============================================================
 * CATEGORIES CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');

const categoriesController = {
    getAll: async (req, res, next) => {
        try {
            const result = await query('SELECT * FROM categories WHERE is_active = true ORDER BY sort_order');
            res.status(200).json({ success: true, data: { categories: result.rows } });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = categoriesController;
