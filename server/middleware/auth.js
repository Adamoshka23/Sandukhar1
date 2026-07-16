/**
 * ============================================================
 * AUTHENTICATION MIDDLEWARE
 * JWT Verification & User Extraction
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const environment = require('../config/environment');
const { query } = require('../config/database');

/**
 * Verify JWT token from Authorization header
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, environment.JWT_SECRET);

        // Check if user still exists and is active
        const result = await query(
            'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.'
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated. Please contact support.'
            });
        }

        // Check if token is blacklisted
        const tokenCheck = await query(
            'SELECT id FROM refresh_tokens WHERE token = $1 AND is_revoked = true',
            [token]
        );

        if (tokenCheck.rows.length > 0) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked. Please login again.'
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.',
                code: 'TOKEN_INVALID'
            });
        }

        next(error);
    }
}

/**
 * Optional authentication — attaches user if token is valid, but doesn't block if not
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, environment.JWT_SECRET);

        const result = await query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1 AND is_active = true',
            [decoded.userId]
        );

        if (result.rows.length > 0) {
            req.user = {
                id: result.rows[0].id,
                email: result.rows[0].email,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name,
                role: result.rows[0].role
            };
        }
    } catch (error) {
        // Silently continue without user
    }
    next();
}

module.exports = { authenticate, optionalAuth };