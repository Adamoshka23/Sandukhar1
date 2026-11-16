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
const environment = require('../config/environment');

// Stored image URLs are relative (e.g. /uploads/products/x.jpg) so the
// browser resolves them against the current origin — but Telegram's
// servers need an absolute, publicly reachable URL to fetch a photo from.
function toAbsoluteUrl(url) {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.FRONTEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

const cartInquiryController = {
    /**
     * POST /api/cart-inquiries
     */
    create: async (req, res, next) => {
        try {
            const {
                items, contactName, contactEmail, contactPhone, contactTelegram, shippingAddress, notes
            } = req.body;

            if (!Array.isArray(items) || items.length === 0 || !contactName || !contactPhone) {
                return res.status(400).json({ success: false, message: 'Items, name and phone are required.' });
            }

            const result = await query(`
                INSERT INTO cart_inquiries (id, user_id, items, contact_name, contact_email, contact_phone, contact_telegram, shipping_address, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, created_at
            `, [
                uuidv4(), req.user ? req.user.id : null, JSON.stringify(items), contactName, contactEmail || null,
                contactPhone, contactTelegram || null, shippingAddress ? JSON.stringify(shippingAddress) : null, notes || null
            ]);

            res.status(201).json({
                success: true,
                message: 'Your request has been received. Our atelier will contact you shortly with pricing.',
                data: { request: result.rows[0] }
            });

            const itemsList = items.map(i => {
                const specParts = [];
                if (i.color) specParts.push('Цвет: ' + escapeHtml(i.color));
                if (i.hardware) specParts.push('Фурнитура: ' + escapeHtml(i.hardware));
                const specs = specParts.length ? ` (${specParts.join(', ')})` : '';
                return `${escapeHtml(i.name)} x ${i.quantity}${specs}`;
            }).join('\n');
            const telegramText = `<b>Запрос цены</b>\n\n${itemsList}\n\n${escapeHtml(contactName)}${contactPhone ? '\n' + escapeHtml(contactPhone) : ''}${contactEmail ? '\n' + escapeHtml(contactEmail) : ''}${contactTelegram ? '\n@' + escapeHtml(contactTelegram.replace(/^@/, '')) : ''}${notes ? '\n\n' + escapeHtml(notes) : ''}`;

            notifyNew('cart_inquiry', {
                id: result.rows[0].id,
                phone: contactPhone,
                telegram: contactTelegram,
                email: contactEmail,
                images: items.map(i => toAbsoluteUrl(i.imageUrl)).filter(Boolean),
                shortLabel: `Запрос цены — ${escapeHtml(contactName)}`,
                telegramText,
                emailSubject: `New price request — ${items.length} item${items.length > 1 ? 's' : ''}`,
                emailHtml: `<h2>New price request</h2><p>${itemsList.replace(/\n/g, '<br>')}</p><p>${escapeHtml(contactName)}${contactPhone ? '<br>' + escapeHtml(contactPhone) : ''}${contactEmail ? '<br>' + escapeHtml(contactEmail) : ''}</p>${notes ? `<p>${escapeHtml(notes)}</p>` : ''}`
            }).catch(() => {});
            query('UPDATE cart_inquiries SET telegram_message = $2 WHERE id = $1', [result.rows[0].id, telegramText]).catch(() => {});
        } catch (error) {
            next(error);
        }
    }
};

module.exports = cartInquiryController;
