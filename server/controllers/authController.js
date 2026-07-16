/**
 * ============================================================
 * AUTH CONTROLLER
 * ============================================================
 */

const { query, getClient } = require('../config/database');
const jwtService = require('../services/jwtService');
const passwordService = require('../services/passwordService');
const { v4: uuidv4 } = require('uuid');

const authController = {
    /**
     * Register new user
     */
    register: async (req, res, next) => {
        const client = await getClient();
        try {
            await client.query('BEGIN');

            const { email, password, firstName, lastName } = req.body;

            // Check existing user
            const existing = await client.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existing.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists.'
                });
            }

            // Hash password
            const passwordHash = await passwordService.hash(password);

            // Create user
            const result = await client.query(
                `INSERT INTO users (id, email, password_hash, first_name, last_name, role)
                 VALUES ($1, $2, $3, $4, $5, 'customer')
                 RETURNING id, email, first_name, last_name, role, created_at`,
                [uuidv4(), email, passwordHash, firstName || null, lastName || null]
            );

            const user = result.rows[0];

            // Generate tokens
            const accessToken = jwtService.generateAccessToken(user);
            const refreshToken = jwtService.generateRefreshToken(user);

            // Store refresh token
            await client.query(
                `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
                 VALUES ($1, $2, $3, $4)`,
                [uuidv4(), user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        role: user.role
                    },
                    accessToken,
                    refreshToken
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    /**
     * Login user
     */
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Find user
            const result = await query(
                'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password.'
                });
            }

            const user = result.rows[0];

            // Check if active
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }

            // Verify password
            const isPasswordValid = await passwordService.verify(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password.'
                });
            }

            // Update last login
            await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

            // Generate tokens
            const accessToken = jwtService.generateAccessToken(user);
            const refreshToken = jwtService.generateRefreshToken(user);

            // Store refresh token
            await query(
                `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
                 VALUES ($1, $2, $3, $4)`,
                [uuidv4(), user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
            );

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        role: user.role
                    },
                    accessToken,
                    refreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Refresh access token
     */
    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required.'
                });
            }

            // Verify token exists and is not revoked
            const tokenResult = await query(
                'SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()',
                [refreshToken]
            );

            if (tokenResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired refresh token.'
                });
            }

            const storedToken = tokenResult.rows[0];

            // Verify JWT
            const decoded = jwtService.verifyRefreshToken(refreshToken);

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token.'
                });
            }

            // Get user
            const userResult = await query(
                'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1 AND is_active = true',
                [storedToken.user_id]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or deactivated.'
                });
            }

            const user = userResult.rows[0];

            // Revoke old refresh token
            await query('UPDATE refresh_tokens SET is_revoked = true WHERE id = $1', [storedToken.id]);

            // Generate new tokens
            const newAccessToken = jwtService.generateAccessToken(user);
            const newRefreshToken = jwtService.generateRefreshToken(user);

            // Store new refresh token
            await query(
                `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
                 VALUES ($1, $2, $3, $4)`,
                [uuidv4(), user.id, newRefreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
            );

            res.status(200).json({
                success: true,
                data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Logout user — revoke refresh token
     */
    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                await query(
                    'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
                    [refreshToken]
                );
            }

            // Revoke all tokens for user (optional)
            if (req.user) {
                await query(
                    'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1 AND is_revoked = false',
                    [req.user.id]
                );
            }

            res.status(200).json({
                success: true,
                message: 'Logged out successfully.'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get current user profile
     */
    getMe: async (req, res, next) => {
        try {
            const result = await query(
                `SELECT id, email, first_name, last_name, phone, role, avatar_url,
                        measurements, email_verified, created_at, last_login
                 FROM users WHERE id = $1`,
                [req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            const user = result.rows[0];

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        phone: user.phone,
                        role: user.role,
                        avatarUrl: user.avatar_url,
                        measurements: user.measurements,
                        emailVerified: user.email_verified,
                        createdAt: user.created_at,
                        lastLogin: user.last_login
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;