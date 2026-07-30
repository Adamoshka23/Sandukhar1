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

async function sendTelegramNotification(text) {
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
                disable_web_page_preview: true
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

/**
 * Fires both channels in parallel. Never throws — callers can
 * fire-and-forget this after their own DB write has committed.
 */
async function notifyNew(kind, { telegramText, emailSubject, emailHtml }) {
    await Promise.all([
        sendTelegramNotification(telegramText),
        sendEmailNotification(emailSubject, emailHtml)
    ]);
}

module.exports = { notifyNew, sendTransactionalEmail, escapeHtml };
