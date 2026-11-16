require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production — refusing to start with the insecure dev defaults.');
}

const environment = {
    NODE_ENV,
    PORT: parseInt(process.env.PORT, 10) || 3000,

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    DB_NAME: process.env.DB_NAME || 'sandukhar',
    DB_USER: process.env.DB_USER || 'sandukhar_admin',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    // Most self-hosted/single-server Postgres setups (including a plain
    // VPS install) don't have SSL configured — only turn this on for a
    // managed database provider that requires it.
    DB_SSL: process.env.DB_SSL === 'true',

    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,

    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5500',
    // Where verification/reset links should point — the frontend's own origin.
    FRONTEND_URL: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5500',

    // Base to prefix onto stored /uploads paths. In production the API sits
    // behind the same domain as the frontend (nginx proxies /uploads to this
    // process), so a bare relative path resolves correctly on its own — only
    // local dev needs an absolute origin, since the frontend (port 5500) and
    // this API (port 3000) are different origins there.
    UPLOADS_ORIGIN: NODE_ENV === 'production' ? '' : `http://localhost:${parseInt(process.env.PORT, 10) || 3000}`,

    // Order/enquiry notifications (optional — notifications are skipped
    // with a console warning if these are left unset).
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
    // Verifies incoming Telegram webhook calls really came from Telegram
    // (sent back as the X-Telegram-Bot-Api-Secret-Token header on every
    // update once set via the setWebhook API call) — see
    // server/routes/telegramWebhook.js.
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    NOTIFY_EMAIL_FROM: process.env.NOTIFY_EMAIL_FROM || 'SAN DUKHAR <onboarding@resend.dev>',
    NOTIFY_EMAIL_TO: process.env.NOTIFY_EMAIL_TO || ''
};

module.exports = environment;