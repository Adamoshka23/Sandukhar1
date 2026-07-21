/**
 * ============================================================
 * ADDRESSES CONTROLLER
 * ============================================================
 */

const { query, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const addressesController = {
    getAll: async (req, res, next) => {
        try {
            const result = await query(
                'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
                [req.user.id]
            );
            res.status(200).json({ success: true, data: { addresses: result.rows } });
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        const client = await getClient();
        try {
            const { label, firstName, lastName, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

            if (!firstName || !lastName || !addressLine1 || !city || !postalCode) {
                return res.status(400).json({ success: false, message: 'Missing required address fields.' });
            }

            await client.query('BEGIN');

            if (isDefault) {
                await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
            }

            const result = await client.query(`
                INSERT INTO addresses (id, user_id, label, first_name, last_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `, [
                uuidv4(), req.user.id, label || 'Primary', firstName, lastName, addressLine1, addressLine2 || null,
                city, state || null, postalCode, country || 'Turkey', phone || null, isDefault || false
            ]);

            await client.query('COMMIT');
            res.status(201).json({ success: true, data: { address: result.rows[0] } });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    update: async (req, res, next) => {
        const client = await getClient();
        try {
            const { id } = req.params;
            const { label, firstName, lastName, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

            await client.query('BEGIN');

            if (isDefault) {
                await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
            }

            const result = await client.query(`
                UPDATE addresses SET
                    label = COALESCE($3, label), first_name = COALESCE($4, first_name), last_name = COALESCE($5, last_name),
                    address_line1 = COALESCE($6, address_line1), address_line2 = $7, city = COALESCE($8, city),
                    state = $9, postal_code = COALESCE($10, postal_code), country = COALESCE($11, country),
                    phone = $12, is_default = COALESCE($13, is_default)
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `, [id, req.user.id, label, firstName, lastName, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: 'Address not found.' });
            }

            await client.query('COMMIT');
            res.status(200).json({ success: true, data: { address: result.rows[0] } });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    remove: async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Address not found.' });
            }

            res.status(200).json({ success: true, message: 'Address deleted.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = addressesController;
