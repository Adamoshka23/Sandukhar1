/**
 * ============================================================
 * TRANSLATIONS CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');

const translationsController = {
    getByLocale: async (req, res, next) => {
        try {
            const { locale = 'en' } = req.query;
            const result = await query('SELECT * FROM translations WHERE locale = $1 ORDER BY key', [locale]);
            res.status(200).json({ success: true, data: { translations: result.rows } });
        } catch (error) {
            next(error);
        }
    },

    getAll: async (req, res, next) => {
        try {
            const result = await query('SELECT * FROM translations ORDER BY key, locale');
            res.status(200).json({ success: true, data: { translations: result.rows } });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = translationsController;
