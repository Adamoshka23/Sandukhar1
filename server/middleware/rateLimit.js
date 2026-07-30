/**
 * ============================================================
 * RATE LIMITING
 * Slows down brute-force login attempts and enquiry-form spam.
 * ============================================================
 */

const rateLimit = require('express-rate-limit');

// Login/register: a handful of tries per IP, then a cooldown.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' }
});

// Public write-endpoints (orders, tailoring, contact) that don't require
// login — looser than auth, just enough to blunt scripted spam.
const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again shortly.' }
});

module.exports = { authLimiter, submissionLimiter };
