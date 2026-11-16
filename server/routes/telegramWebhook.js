/**
 * ============================================================
 * TELEGRAM WEBHOOK
 * Handles status-button taps on inquiry notifications, so staff
 * can update status without opening the admin panel. The
 * WhatsApp/Telegram/email contact buttons are shown immediately
 * on the original message (see server/utils/notifications.js) —
 * this handler only ever needs to freeze the status row, never
 * reveal the contact row.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const environment = require('../config/environment');
const { contactButtonsRow, escapeHtml } = require('../utils/notifications');

const TYPE_TABLE = { c: 'cart_inquiries', t: 'tailoring_orders', e: 'contact_enquiries' };
// contact_enquiries names its columns without the contact_ prefix and
// doesn't have a single "name" column — everything else is uniform.
const CONTACT_COLUMNS = {
    cart_inquiries: 'contact_email AS email, contact_phone AS phone, contact_telegram AS telegram',
    tailoring_orders: 'contact_email AS email, contact_phone AS phone, contact_telegram AS telegram',
    contact_enquiries: 'email, phone, telegram'
};
const STATUS_MAP = { p: 'in_production', d: 'completed' };
const STATUS_LABEL = { in_production: '🔧 В работе', completed: '✅ Завершено' };
const ATTRIBUTION_LABEL = { in_production: '🔧 Взял в работу', completed: '✅ Завершил' };

function actorName(from) {
    if (!from) return 'Сотрудник';
    const full = [from.first_name, from.last_name].filter(Boolean).join(' ');
    return full || (from.username ? '@' + from.username : 'Сотрудник');
}

function istanbulTimestamp(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Istanbul',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(date);
}

async function callTelegram(method, payload) {
    const { TELEGRAM_BOT_TOKEN } = environment;
    if (!TELEGRAM_BOT_TOKEN) return;
    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        // Telegram's Bot API returns HTTP 200 with {ok:false,...} on most
        // rejected calls (bad method for the message type, stale message,
        // etc.) — checking only for a thrown fetch error missed all of
        // those, so a rejected edit failed completely silently.
        const body = await res.json().catch(() => null);
        if (!res.ok || !body || body.ok === false) {
            console.error(`[telegram webhook] ${method} failed:`, res.status, body);
        }
    } catch (error) {
        console.error(`[telegram webhook] ${method} failed:`, error.message);
    }
}

/**
 * The status row after a tap: the pressed status freezes into a plain
 * label, but "in_production" still leaves "Завершено" actionable so
 * staff can close the request out later.
 */
function statusRow(typeKey, id, status) {
    if (status === 'completed') {
        return [{ text: STATUS_LABEL.completed, callback_data: 'noop' }];
    }
    return [
        { text: STATUS_LABEL.in_production, callback_data: 'noop' },
        { text: STATUS_LABEL.completed, callback_data: `${typeKey}:d:${id}` }
    ];
}

router.post('/webhook', async (req, res) => {
    // Ack immediately — Telegram retries on anything but a fast 200, and
    // whatever we do with the update below doesn't need to block that.
    res.sendStatus(200);

    try {
        if (!environment.TELEGRAM_WEBHOOK_SECRET
            || req.headers['x-telegram-bot-api-secret-token'] !== environment.TELEGRAM_WEBHOOK_SECRET) {
            return;
        }

        const callback = req.body && req.body.callback_query;
        if (!callback || !callback.data) return;

        if (callback.data === 'noop') {
            await callTelegram('answerCallbackQuery', { callback_query_id: callback.id });
            return;
        }

        const [typeKey, statusKey, id] = callback.data.split(':');
        const table = TYPE_TABLE[typeKey];
        if (!table || !id) return;

        // "m" = reveal the email in a popup — Telegram buttons can't open
        // a mail app directly (see contactButtonsRow in notifications.js),
        // so this is a read-only lookup, no status change.
        if (statusKey === 'm') {
            const emailResult = await query(`SELECT ${CONTACT_COLUMNS[table]} FROM ${table} WHERE id = $1`, [id]);
            await callTelegram('answerCallbackQuery', {
                callback_query_id: callback.id,
                text: emailResult.rows[0] && emailResult.rows[0].email ? emailResult.rows[0].email : 'Email не указан',
                show_alert: true
            });
            return;
        }

        const status = STATUS_MAP[statusKey];
        if (!status) return;

        const attributionLine = `${ATTRIBUTION_LABEL[status]}: ${escapeHtml(actorName(callback.from))} — ${istanbulTimestamp(new Date())}`;

        const result = await query(
            `UPDATE ${table} SET status = $2 WHERE id = $1 RETURNING ${CONTACT_COLUMNS[table]}, telegram_message`,
            [id, status]
        );

        if (result.rows.length === 0) {
            await callTelegram('answerCallbackQuery', {
                callback_query_id: callback.id,
                text: 'Заявка не найдена (возможно, уже удалена).',
                show_alert: true
            });
            return;
        }

        const row = result.rows[0];
        const baseText = row.telegram_message || callback.message.text || '';
        const newText = `${baseText}\n\n${attributionLine}`;

        const contactRow = contactButtonsRow(row, typeKey, id);
        const inlineKeyboard = [statusRow(typeKey, id, status)];
        if (contactRow.length > 0) inlineKeyboard.push(contactRow);

        // A single-photo enquiry was sent via sendPhoto (the text lives in
        // its caption), not sendMessage — Telegram rejects editMessageText
        // on that message ("there is no text in the message to edit") and
        // editMessageCaption must be used instead. Multi-photo enquiries
        // send the text as its own plain message, so .photo is absent there
        // and editMessageText is correct.
        const isPhotoMessage = Array.isArray(callback.message.photo) && callback.message.photo.length > 0;
        const editPayload = {
            chat_id: callback.message.chat.id,
            message_id: callback.message.message_id,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
        };
        if (isPhotoMessage) {
            // Captions cap at 1024 chars (vs. 4096 for a message) — the
            // original merge only happens when it already fit, but the
            // attribution lines added here could push a borderline-long
            // one over, so truncate rather than let the whole edit fail.
            editPayload.caption = newText.length > 1024 ? newText.slice(0, 1023) + '…' : newText;
        } else {
            editPayload.text = newText;
            editPayload.disable_web_page_preview = true;
        }

        await Promise.all([
            query(`UPDATE ${table} SET telegram_message = $2 WHERE id = $1`, [id, newText]),
            callTelegram('answerCallbackQuery', {
                callback_query_id: callback.id,
                text: `Статус обновлён: ${STATUS_LABEL[status]}`
            }),
            callTelegram(isPhotoMessage ? 'editMessageCaption' : 'editMessageText', editPayload)
        ]);
    } catch (error) {
        console.error('[telegram webhook] error:', error.message);
    }
});

module.exports = router;
