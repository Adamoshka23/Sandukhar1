/**
 * ============================================================
 * AUTH CONTROLLER
 * ============================================================
 */

const crypto = require('crypto');
const { query, getClient } = require('../config/database');
const jwtService = require('../services/jwtService');
const passwordService = require('../services/passwordService');
const { v4: uuidv4 } = require('uuid');
const environment = require('../config/environment');
const { sendTransactionalEmail } = require('../utils/notifications');

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function issueVerificationEmail(user) {
    const token = crypto.randomBytes(32).toString('hex');
    await query(
        `INSERT INTO email_verification_tokens (id, user_id, token, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), user.id, token, new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)]
    );

    const verifyUrl = `${environment.FRONTEND_URL}/account.html?verify=${token}`;
    const firstName = user.first_name || user.firstName || '';

    return sendTransactionalEmail(
        user.email,
        'Confirm your email — SAN DUKHAR',
        `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;">
            <h1 style="font-weight:300;letter-spacing:2px;font-size:20px;">SAN DUKHAR</h1>
            <p>Hello${firstName ? ' ' + firstName : ''},</p>
            <p>Please confirm your email address to activate your SAN DUKHAR account.</p>
            <p style="margin:28px 0;">
                <a href="${verifyUrl}" style="background:#c5a572;color:#0a0a0a;padding:12px 28px;text-decoration:none;font-size:14px;letter-spacing:1px;">CONFIRM EMAIL</a>
            </p>
            <p style="font-size:12px;color:#777;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
        </div>`
    );
}

async function issuePasswordResetEmail(user) {
    const token = crypto.randomBytes(32).toString('hex');
    await query(
        `INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), user.id, token, new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS)]
    );

    const resetUrl = `${environment.FRONTEND_URL}/account.html?reset=${token}`;
    const firstName = user.first_name || user.firstName || '';

    return sendTransactionalEmail(
        user.email,
        'Reset your password — SAN DUKHAR',
        `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;">
            <h1 style="font-weight:300;letter-spacing:2px;font-size:20px;">SAN DUKHAR</h1>
            <p>Hello${firstName ? ' ' + firstName : ''},</p>
            <p>We received a request to reset your SAN DUKHAR account password. Click below to choose a new one.</p>
            <p style="margin:28px 0;">
                <a href="${resetUrl}" style="background:#c5a572;color:#0a0a0a;padding:12px 28px;text-decoration:none;font-size:14px;letter-spacing:1px;">RESET PASSWORD</a>
            </p>
            <p style="font-size:12px;color:#777;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
        </div>`
    );
}

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
                        role: user.role,
                        emailVerified: false
                    },
                    accessToken,
                    refreshToken
                }
            });

            // Fire-and-forget — never let a flaky email provider affect registration.
            issueVerificationEmail(user).catch(() => {});
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
                'SELECT id, email, password_hash, first_name, last_name, role, is_active, email_verified FROM users WHERE email = $1',
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
                        role: user.role,
                        emailVerified: user.email_verified
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
    },

    /**
     * Confirm a registration email via the token from the emailed link
     */
    verifyEmail: async (req, res, next) => {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification token is required.'
                });
            }

            const tokenResult = await query(
                'SELECT * FROM email_verification_tokens WHERE token = $1 AND expires_at > NOW()',
                [token]
            );

            if (tokenResult.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This verification link is invalid or has expired.'
                });
            }

            const record = tokenResult.rows[0];

            await query('UPDATE users SET email_verified = true WHERE id = $1', [record.user_id]);
            await query('DELETE FROM email_verification_tokens WHERE user_id = $1', [record.user_id]);

            res.status(200).json({
                success: true,
                message: 'Email verified successfully.'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Resend the verification email to the signed-in user
     */
    resendVerification: async (req, res, next) => {
        try {
            const result = await query(
                'SELECT id, email, first_name, email_verified FROM users WHERE id = $1',
                [req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            const user = result.rows[0];

            if (user.email_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already verified.'
                });
            }

            // Invalidate any previously issued tokens before sending a new one.
            await query('DELETE FROM email_verification_tokens WHERE user_id = $1', [user.id]);
            await issueVerificationEmail(user);

            res.status(200).json({
                success: true,
                message: 'Verification email sent.'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Request a password reset email. Always responds with the same generic
     * message whether or not the email is registered, so this endpoint can't
     * be used to enumerate accounts.
     */
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body;
            const genericMessage = 'If an account exists for that email, a password reset link has been sent.';

            const result = await query(
                'SELECT id, email, first_name FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length > 0) {
                const user = result.rows[0];
                await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
                await issuePasswordResetEmail(user);
            }

            res.status(200).json({
                success: true,
                message: genericMessage
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Consume a password reset token and set a new password.
     */
    resetPassword: async (req, res, next) => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Token and new password are required.'
                });
            }

            const tokenResult = await query(
                'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
                [token]
            );

            if (tokenResult.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This reset link is invalid or has expired.'
                });
            }

            const record = tokenResult.rows[0];
            const passwordHash = await passwordService.hash(password);

            // Clearing refresh_token signs the account out everywhere else.
            await query('UPDATE users SET password_hash = $1, refresh_token = NULL WHERE id = $2', [passwordHash, record.user_id]);
            await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [record.user_id]);

            res.status(200).json({
                success: true,
                message: 'Password updated successfully.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;