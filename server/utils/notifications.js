/**
 * ============================================================
 * NOTIFICATIONS — Telegram + email alerts for new orders,
 * tailoring requests, and contact enquiries.
 *
 * Both channels are best-effort: if the relevant env vars are
 * not configured, the function logs a warning once and resolves
 * without throwing, so a missing integration never blocks the
 * underlying order/enquiry from being saved.
 * ============================================================
 */

const environment = require('../config/environment');

let warnedTelegram = false;
let warnedEmail = false;

async function sendTelegramNotification(text, replyMarkup) {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = environment;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        if (!warnedTelegram) {
            console.warn('[notifications] Telegram not configured — skipping (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID).');
            warnedTelegram = true;
        }
        return;
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                ...(replyMarkup ? { reply_markup: replyMarkup } : {})
            })
        });
        if (!res.ok) {
            const body = await res.text();
            console.error('[notifications] Telegram send failed:', res.status, body);
        }
    } catch (error) {
        console.error('[notifications] Telegram send error:', error.message);
    }
}

async function callTelegramApi(method, payload) {
    const { TELEGRAM_BOT_TOKEN } = environment;
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) console.error(`[notifications] Telegram ${method} failed:`, res.status, await res.text());
    return res;
}

// Telegram caps captions (on sendPhoto/sendMediaGroup) at 1024 chars vs.
// 4096 for a plain message — stay well clear so a merged photo+text send
// never gets rejected for a borderline-long customer note.
const TELEGRAM_CAPTION_LIMIT = 1024;

/**
 * Sends product photo(s) together with the enquiry notification, so staff
 * always see what a request is about without hunting for which photo goes
 * with which text.
 *
 * - No photos: falls back to a plain text+buttons message.
 * - One photo, text short enough to fit as a caption: merged into a single
 *   sendPhoto message (photo + full text + buttons) — no ambiguity possible.
 * - Otherwise (2+ photos, or a single photo whose text is too long for a
 *   caption): Telegram's Bot API doesn't accept a reply_markup on
 *   sendPhoto-as-album or sendMediaGroup, so the photo(s) go out first with
 *   a short caption identifying the request (e.g. "Запрос цены — Имя"),
 *   immediately followed by the full text+buttons message.
 */
async function sendTelegramWithPhotos({ text, images, replyMarkup, shortLabel }) {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = environment;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        if (!warnedTelegram) {
            console.warn('[notifications] Telegram not configured — skipping (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID).');
            warnedTelegram = true;
        }
        return;
    }

    const photos = [...new Set((images || []).filter(Boolean))].slice(0, 10);

    if (photos.length === 0) {
        return sendTelegramNotification(text, replyMarkup);
    }

    try {
        if (photos.length === 1 && text.length <= TELEGRAM_CAPTION_LIMIT) {
            const res = await callTelegramApi('sendPhoto', {
                chat_id: TELEGRAM_CHAT_ID,
                photo: photos[0],
                caption: text,
                parse_mode: 'HTML',
                ...(replyMarkup ? { reply_markup: replyMarkup } : {})
            });
            // Merged into one message — but if Telegram rejected it (e.g. an
            // unreachable photo URL), the text+buttons still have to reach
            // staff, so fall through to the plain-text send below instead
            // of silently dropping the whole notification.
            if (res.ok) return;
        }

        const caption = shortLabel ? { caption: shortLabel, parse_mode: 'HTML' } : {};
        if (photos.length === 1) {
            await callTelegramApi('sendPhoto', { chat_id: TELEGRAM_CHAT_ID, photo: photos[0], ...caption });
        } else {
            const media = photos.map((url, i) => ({ type: 'photo', media: url, ...(i === 0 ? caption : {}) }));
            await callTelegramApi('sendMediaGroup', { chat_id: TELEGRAM_CHAT_ID, media });
        }
    } catch (error) {
        console.error('[notifications] Telegram photo send error:', error.message);
    }

    await sendTelegramNotification(text, replyMarkup);
}

async function sendEmailNotification(subject, html) {
    const { RESEND_API_KEY, NOTIFY_EMAIL_FROM, NOTIFY_EMAIL_TO } = environment;
    if (!RESEND_API_KEY || !NOTIFY_EMAIL_TO) {
        if (!warnedEmail) {
            console.warn('[notifications] Email not configured — skipping (set RESEND_API_KEY and NOTIFY_EMAIL_TO).');
            warnedEmail = true;
        }
        return;
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: NOTIFY_EMAIL_FROM,
                to: NOTIFY_EMAIL_TO,
                subject,
                html
            })
        });
        if (!res.ok) {
            const body = await res.text();
            console.error('[notifications] Email send failed:', res.status, body);
        }
    } catch (error) {
        console.error('[notifications] Email send error:', error.message);
    }
}

/**
 * Sends a transactional email to an arbitrary recipient (verification,
 * password reset, etc.) — unlike sendEmailNotification, which always
 * goes to the site owner's own NOTIFY_EMAIL_TO inbox.
 *
 * Note: on Resend's shared onboarding@resend.dev sender, delivery is
 * restricted to the Resend account's own verified address until a
 * custom domain is verified. Recipients outside that will fail silently
 * from the user's perspective (logged here, not thrown).
 */
async function sendTransactionalEmail(to, subject, html) {
    const { RESEND_API_KEY, NOTIFY_EMAIL_FROM } = environment;
    if (!RESEND_API_KEY) {
        if (!warnedEmail) {
            console.warn('[notifications] Email not configured — skipping (set RESEND_API_KEY).');
            warnedEmail = true;
        }
        return { sent: false };
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({ from: NOTIFY_EMAIL_FROM, to, subject, html })
        });
        if (!res.ok) {
            const body = await res.text();
            console.error('[notifications] Transactional email failed:', res.status, body);
            return { sent: false };
        }
        return { sent: true };
    } catch (error) {
        console.error('[notifications] Transactional email error:', error.message);
        return { sent: false };
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// One-letter type keys keep callback_data (64-byte Telegram limit) short:
// c = cart_inquiries, t = tailoring_orders, e = contact_enquiries.
// Kept in sync with server/routes/telegramWebhook.js, which reads these
// same keys back out.
const INQUIRY_TYPE_KEYS = { cart_inquiry: 'c', tailoring: 't', contact: 'e' };

/**
 * Builds the row of direct-contact buttons (WhatsApp/Telegram/email) for
 * whichever channels the customer actually provided. Shared with
 * server/routes/telegramWebhook.js, which rebuilds this same row when it
 * freezes the status row after a status button is tapped.
 *
 * Telegram's Bot API rejects `mailto:` as a button URL (BUTTON_URL_INVALID)
 * — there's no way to open the device's mail app in one tap from a bot
 * button. The email button is callback_data instead; tapping it shows the
 * address in a popup (handled in telegramWebhook.js) so staff can read/copy
 * it, which is the closest Telegram allows to a one-tap "open email".
 */
function contactButtonsRow({ phone, telegram, email }, typeKey, id) {
    const buttons = [];
    if (phone) {
        const digits = String(phone).replace(/[^\d]/g, '');
        if (digits) buttons.push({ text: '💬 WhatsApp', url: `https://wa.me/${digits}` });
    }
    if (telegram) {
        const username = String(telegram).replace(/^@/, '').trim();
        if (username) buttons.push({ text: '✈️ Telegram', url: `https://t.me/${username}` });
    }
    if (email && typeKey && id) {
        buttons.push({ text: '✉️ Email', callback_data: `${typeKey}:m:${id}` });
    }
    return buttons;
}

/**
 * Builds the inline keyboard attached to a new inquiry notification: a
 * status row ("В работу" / "Завершено", so staff can update status right
 * from Telegram) plus a contact row (WhatsApp/Telegram/email links) shown
 * immediately — not revealed later — so there's no dependency on a
 * follow-up edit succeeding.
 */
function inquiryActionButtons(kind, id, contact) {
    const typeKey = INQUIRY_TYPE_KEYS[kind];
    if (!typeKey || !id) return undefined;
    const rows = [[
        { text: '🔧 В работу', callback_data: `${typeKey}:p:${id}` },
        { text: '✅ Завершено', callback_data: `${typeKey}:d:${id}` }
    ]];
    const contactRow = contactButtonsRow(contact || {}, typeKey, id);
    if (contactRow.length > 0) rows.push(contactRow);
    return { inline_keyboard: rows };
}

/**
 * Fires both channels in parallel. Never throws — callers can
 * fire-and-forget this after their own DB write has committed.
 * `id` (the new row's id) is optional — pass it, along with `phone`/
 * `telegram`/`email`, to attach status + contact buttons to the Telegram
 * message for kinds in INQUIRY_TYPE_KEYS. `images` (absolute URLs) is
 * optional — when present, product photo(s) are sent together with the
 * notification (see sendTelegramWithPhotos for exactly how). `shortLabel`
 * is a short plain-text caption (e.g. "Запрос цены — Имя клиента") used to
 * identify the photo(s) when they can't be merged into the same message
 * as the full text — otherwise unused.
 */
async function notifyNew(kind, { telegramText, emailSubject, emailHtml, id, phone, telegram, email, images, shortLabel }) {
    await Promise.all([
        sendTelegramWithPhotos({
            text: telegramText,
            images,
            replyMarkup: inquiryActionButtons(kind, id, { phone, telegram, email }),
            shortLabel
        }),
        sendEmailNotification(emailSubject, emailHtml)
    ]);
}

module.exports = { notifyNew, sendTransactionalEmail, escapeHtml, contactButtonsRow };
