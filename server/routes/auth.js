/**
 * ============================================================
 * AUTH ROUTES
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/refresh
 * POST /api/auth/logout
 * GET  /api/auth/me
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const authController = require('../controllers/authController');

router.post('/register', authLimiter, [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').optional().trim().isLength({ min: 1 }),
    body('lastName').optional().trim().isLength({ min: 1 })
], validate, authController.register);

router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 1 }).withMessage('Password is required')
], validate, authController.login);

router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authenticate, authController.resendVerification);

module.exports = router;