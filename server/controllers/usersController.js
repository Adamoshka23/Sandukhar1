/**
 * ============================================================
 * USERS CONTROLLER
 * ============================================================
 */

const { query } = require('../config/database');
const passwordService = require('../services/passwordService');

const usersController = {
    /**
     * PATCH /api/users/me
     */
    updateMe: async (req, res, next) => {
        try {
            const { firstName, lastName, phone, measurements } = req.body;

            const result = await query(`
                UPDATE users SET
                    first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    phone = COALESCE($4, phone),
                    measurements = COALESCE($5, measurements)
                WHERE id = $1
                RETURNING id, email, first_name, last_name, phone, measurements
            `, [req.user.id, firstName, lastName, phone, measurements ? JSON.stringify(measurements) : null]);

            const user = result.rows[0];
            res.status(200).json({
                success: true,
                message: 'Profile updated.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        phone: user.phone,
                        measurements: user.measurements
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/users/me/password
     */
    changePassword: async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword || newPassword.length < 8) {
                return res.status(400).json({ success: false, message: 'A valid current and new password (min 8 chars) are required.' });
            }

            const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
            const isValid = await passwordService.verify(currentPassword, result.rows[0].password_hash);

            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
            }

            const newHash = await passwordService.hash(newPassword);
            await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

            res.status(200).json({ success: true, message: 'Password updated successfully.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = usersController;
