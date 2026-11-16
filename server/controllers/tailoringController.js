/**
 * ============================================================
 * TAILORING (BESPOKE) CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { notifyNew, escapeHtml } = require('../utils/notifications');

const tailoringController = {
    /**
     * POST /api/tailoring
     */
    create: async (req, res, next) => {
        try {
            const {
                productType, productTypeLabel, material, materialLabel, color, colorLabel,
                lining, hardware, hardwareLabel, sizeType, sizeLabel,
                measurements, notes, contactName, contactEmail, contactPhone, contactTelegram
            } = req.body;

            if (!productType || !contactName || !contactEmail) {
                return res.status(400).json({ success: false, message: 'Product type, name and email are required.' });
            }

            const result = await query(`
                INSERT INTO tailoring_orders (id, user_id, product_type, material, color, lining, hardware, size_type, measurements, notes, contact_name, contact_email, contact_phone, contact_telegram)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING id, created_at
            `, [
                uuidv4(), req.user ? req.user.id : null, productType, material || null, color || null,
                lining || null, hardware || null, sizeType || null,
                JSON.stringify(measurements || {}), notes || null, contactName, contactEmail, contactPhone || null, contactTelegram || null
            ]);

            res.status(201).json({
                success: true,
                message: 'Your bespoke enquiry has been received. Our atelier will contact you within 48 hours.',
                data: { request: result.rows[0] }
            });

            const specSteps = [productTypeLabel || productType, materialLabel, colorLabel, sizeLabel, hardwareLabel]
                .filter(Boolean)
                .map((label, i) => `${i + 1}. ${escapeHtml(label)}`)
                .join('\n');

            const telegramText = `<b>Запрос на пошив</b>\n\n${specSteps}\n\n${escapeHtml(contactName)}\n${escapeHtml(contactEmail)}${contactPhone ? '\n' + escapeHtml(contactPhone) : ''}${contactTelegram ? '\n@' + escapeHtml(contactTelegram.replace(/^@/, '')) : ''}${notes ? '\n\n' + escapeHtml(notes) : ''}`;

            notifyNew('tailoring', {
                id: result.rows[0].id,
                phone: contactPhone,
                telegram: contactTelegram,
                email: contactEmail,
                telegramText,
                emailSubject: `New bespoke enquiry — ${productType}`,
                emailHtml: `<h2>New bespoke enquiry</h2><p><strong>${escapeHtml(productType)}</strong>${material ? ' — ' + escapeHtml(material) : ''}</p><p>${escapeHtml(contactName)}<br>${escapeHtml(contactEmail)}${contactPhone ? '<br>' + escapeHtml(contactPhone) : ''}</p>${notes ? `<p>${escapeHtml(notes)}</p>` : ''}`
            }).catch(() => {});
            query('UPDATE tailoring_orders SET telegram_message = $2 WHERE id = $1', [result.rows[0].id, telegramText]).catch(() => {});
        } catch (error) {
            next(error);
        }
    }
};

module.exports = tailoringController;
