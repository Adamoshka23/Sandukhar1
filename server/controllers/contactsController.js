/**
 * ============================================================
 * CONTACTS CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const contactsController = {
    /**
     * POST /api/contacts
     */
    create: async (req, res, next) => {
        try {
            const { firstName, lastName, email, phone, subject, message } = req.body;

            if (!firstName || !lastName || !email || !message) {
                return res.status(400).json({ success: false, message: 'First name, last name, email and message are required.' });
            }

            const result = await query(`
                INSERT INTO contact_enquiries (id, first_name, last_name, email, phone, subject, message)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, created_at
            `, [uuidv4(), firstName, lastName, email, phone || null, subject || null, message]);

            res.status(201).json({
                success: true,
                message: 'Your message has been sent. Our concierge team will respond within 24 hours.',
                data: { enquiry: result.rows[0] }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = contactsController;
