/**
 * ============================================================
 * NEWSLETTER CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const newsletterController = {
    /**
     * POST /api/newsletter { email }
     */
    subscribe: async (req, res, next) => {
        try {
            const { email } = req.body;

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ success: false, message: 'A valid email is required.' });
            }

            await query(`
                INSERT INTO newsletter_subscribers (id, email)
                VALUES ($1, $2)
                ON CONFLICT (email) DO UPDATE SET is_active = true, unsubscribed_at = NULL
            `, [uuidv4(), email]);

            res.status(200).json({ success: true, message: 'You have been subscribed to the SAN DUKHAR journal.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = newsletterController;
