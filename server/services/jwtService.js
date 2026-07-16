/**
 * ============================================================
 * JWT SERVICE
 * Token generation and verification
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const environment = require('../config/environment');

const jwtService = {
    /**
     * Generate access token
     * @param {Object} user - User object with id, email, role
     * @returns {string} JWT token
     */
    generateAccessToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            environment.JWT_SECRET,
            { expiresIn: environment.JWT_EXPIRES_IN }
        );
    },

    /**
     * Generate refresh token
     * @param {Object} user - User object with id
     * @returns {string} JWT refresh token
     */
    generateRefreshToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                type: 'refresh'
            },
            environment.JWT_REFRESH_SECRET,
            { expiresIn: environment.JWT_REFRESH_EXPIRES_IN }
        );
    },

    /**
     * Verify access token
     * @param {string} token
     * @returns {Object|null} Decoded payload or null
     */
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, environment.JWT_SECRET);
        } catch (error) {
            return null;
        }
    },

    /**
     * Verify refresh token
     * @param {string} token
     * @returns {Object|null} Decoded payload or null
     */
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, environment.JWT_REFRESH_SECRET);
        } catch (error) {
            return null;
        }
    }
};

module.exports = jwtService;