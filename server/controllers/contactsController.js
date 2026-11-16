/**
 * ============================================================
 * CONTACTS CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { notifyNew, escapeHtml } = require('../utils/notifications');

const contactsController = {
    /**
     * POST /api/contacts
     */
    create: async (req, res, next) => {
        try {
            const { firstName, lastName, email, phone, telegram, subject, message } = req.body;

            if (!firstName || !lastName || !email || !message) {
                return res.status(400).json({ success: false, message: 'First name, last name, email and message are required.' });
            }

            const result = await query(`
                INSERT INTO contact_enquiries (id, first_name, last_name, email, phone, telegram, subject, message)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at
            `, [uuidv4(), firstName, lastName, email, phone || null, telegram || null, subject || null, message]);

            res.status(201).json({
                success: true,
                message: 'Your message has been sent. Our concierge team will respond within 24 hours.',
                data: { enquiry: result.rows[0] }
            });

            const telegramText = `<b>Контактный запрос</b>\n\n${subject ? escapeHtml(subject) + '\n\n' : ''}${escapeHtml(firstName)} ${escapeHtml(lastName)}\n${escapeHtml(email)}${phone ? '\n' + escapeHtml(phone) : ''}${telegram ? '\n@' + escapeHtml(telegram.replace(/^@/, '')) : ''}\n\n${escapeHtml(message)}`;

            notifyNew('contact', {
                id: result.rows[0].id,
                phone,
                telegram,
                email,
                telegramText,
                emailSubject: `New contact enquiry${subject ? ' — ' + subject : ''}`,
                emailHtml: `<h2>New contact enquiry</h2><p>${escapeHtml(firstName)} ${escapeHtml(lastName)}<br>${escapeHtml(email)}${phone ? '<br>' + escapeHtml(phone) : ''}</p><p>${escapeHtml(message)}</p>`
            }).catch(() => {});
            query('UPDATE contact_enquiries SET telegram_message = $2 WHERE id = $1', [result.rows[0].id, telegramText]).catch(() => {});
        } catch (error) {
            next(error);
        }
    }
};

module.exports = contactsController;
