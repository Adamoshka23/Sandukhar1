/**
 * ============================================================
 * PASSWORD SERVICE
 * Bcrypt hashing and verification
 * ============================================================
 */

const bcrypt = require('bcrypt');
const environment = require('../config/environment');

const passwordService = {
    /**
     * Hash a password
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    async hash(password) {
        const salt = await bcrypt.genSalt(environment.BCRYPT_SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    },

    /**
     * Verify a password against a hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if matches
     */
    async verify(password, hash) {
        return bcrypt.compare(password, hash);
    }
};

module.exports = passwordService;