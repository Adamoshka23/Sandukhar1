/**
 * ============================================================
 * TAILORING (BESPOKE) CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const tailoringController = {
    /**
     * POST /api/tailoring
     */
    create: async (req, res, next) => {
        try {
            const {
                productType, material, color, lining, hardware, sizeType,
                measurements, notes, contactName, contactEmail, contactPhone
            } = req.body;

            if (!productType || !contactName || !contactEmail) {
                return res.status(400).json({ success: false, message: 'Product type, name and email are required.' });
            }

            const result = await query(`
                INSERT INTO tailoring_orders (id, user_id, product_type, material, color, lining, hardware, size_type, measurements, notes, contact_name, contact_email, contact_phone)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id, created_at
            `, [
                uuidv4(), req.user ? req.user.id : null, productType, material || null, color || null,
                lining || null, hardware || null, sizeType || null,
                JSON.stringify(measurements || {}), notes || null, contactName, contactEmail, contactPhone || null
            ]);

            res.status(201).json({
                success: true,
                message: 'Your bespoke enquiry has been received. Our atelier will contact you within 48 hours.',
                data: { request: result.rows[0] }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = tailoringController;
