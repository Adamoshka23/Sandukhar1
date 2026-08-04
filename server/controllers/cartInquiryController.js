/**
 * ============================================================
 * CART INQUIRY CONTROLLER
 * No pricing is computed or stored — the customer expresses
 * interest in a set of items and the atelier follows up with
 * pricing directly. Mirrors tailoringController.js.
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { notifyNew, escapeHtml } = require('../utils/notifications');

const cartInquiryController = {
    /**
     * POST /api/cart-inquiries
     */
    create: async (req, res, next) => {
        try {
            const {
                items, contactName, contactEmail, contactPhone, shippingAddress, notes
            } = req.body;

            if (!Array.isArray(items) || items.length === 0 || !contactName || !contactEmail) {
                return res.status(400).json({ success: false, message: 'Items, name and email are required.' });
            }

            const result = await query(`
                INSERT INTO cart_inquiries (id, user_id, items, contact_name, contact_email, contact_phone, shipping_address, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at
            `, [
                uuidv4(), req.user ? req.user.id : null, JSON.stringify(items), contactName, contactEmail,
                contactPhone || null, shippingAddress ? JSON.stringify(shippingAddress) : null, notes || null
            ]);

            res.status(201).json({
                success: true,
                message: 'Your request has been received. Our atelier will contact you shortly with pricing.',
                data: { request: result.rows[0] }
            });

            const itemsList = items.map(i => `${escapeHtml(i.name)}${i.variant ? ' (' + escapeHtml(i.variant) + ')' : ''} × ${i.quantity}`).join('\n');
            notifyNew('cart_inquiry', {
                telegramText: `<b>🛍 New price request</b>\n${itemsList}\n\n${escapeHtml(contactName)}\n${escapeHtml(contactEmail)}${contactPhone ? '\n' + escapeHtml(contactPhone) : ''}${notes ? '\n\n' + escapeHtml(notes) : ''}`,
                emailSubject: `New price request — ${items.length} item${items.length > 1 ? 's' : ''}`,
                emailHtml: `<h2>New price request</h2><p>${itemsList.replace(/\n/g, '<br>')}</p><p>${escapeHtml(contactName)}<br>${escapeHtml(contactEmail)}${contactPhone ? '<br>' + escapeHtml(contactPhone) : ''}</p>${notes ? `<p>${escapeHtml(notes)}</p>` : ''}`
            }).catch(() => {});
        } catch (error) {
            next(error);
        }
    }
};

module.exports = cartInquiryController;
