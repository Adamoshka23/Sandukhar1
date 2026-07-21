/**
 * ============================================================
 * FAQ CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');

const faqController = {
    getAll: async (req, res, next) => {
        try {
            const result = await query('SELECT * FROM faq_items WHERE is_active = true ORDER BY sort_order');
            res.status(200).json({ success: true, data: { faq: result.rows } });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = faqController;
