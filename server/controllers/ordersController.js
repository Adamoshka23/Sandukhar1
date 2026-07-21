/**
 * ============================================================
 * ORDERS CONTROLLER
 * ============================================================
 */

const { query, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function generateOrderNumber() {
    const date = new Date();
    const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SD-${stamp}-${random}`;
}

const ordersController = {
    /**
     * POST /api/orders
     * Creates an order from cart items. Works for logged-in users and guests.
     */
    create: async (req, res, next) => {
        const client = await getClient();
        try {
            const { items, shippingAddress, shippingMethod, paymentMethod, notes } = req.body;

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
            }

            if (!shippingAddress || !shippingAddress.email || !shippingAddress.firstName || !shippingAddress.addressLine1) {
                return res.status(400).json({ success: false, message: 'Shipping address is incomplete.' });
            }

            await client.query('BEGIN');

            const productIds = items.map(item => item.productId);
            const productsResult = await client.query(
                `SELECT id, name_en, name_ru, price, stock FROM products WHERE id = ANY($1::uuid[])`,
                [productIds]
            );

            const productsById = new Map(productsResult.rows.map(p => [p.id, p]));

            let subtotal = 0;
            const resolvedItems = [];

            for (const item of items) {
                const product = productsById.get(item.productId);
                if (!product) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ success: false, message: `Product ${item.productId} not found.` });
                }
                const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
                const unitPrice = parseFloat(product.price);
                const totalPrice = unitPrice * quantity;
                subtotal += totalPrice;
                resolvedItems.push({
                    productId: product.id,
                    productName: product.name_en,
                    variant: item.variant || null,
                    quantity,
                    unitPrice,
                    totalPrice,
                    imageUrl: item.imageUrl || null
                });
            }

            const shippingCost = shippingMethod === 'express' ? 150 : 0;
            const total = subtotal + shippingCost;
            const orderNumber = generateOrderNumber();

            const orderResult = await client.query(`
                INSERT INTO orders (id, order_number, user_id, subtotal, shipping_cost, total,
                    shipping_method, payment_method, shipping_address, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [
                uuidv4(), orderNumber, req.user ? req.user.id : null,
                subtotal, shippingCost, total,
                shippingMethod || 'standard', paymentMethod || 'card',
                JSON.stringify(shippingAddress), notes || null
            ]);

            const order = orderResult.rows[0];

            for (const item of resolvedItems) {
                await client.query(`
                    INSERT INTO order_items (id, order_id, product_id, product_name, variant, quantity, unit_price, total_price, image_url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    uuidv4(), order.id, item.productId, item.productName, item.variant,
                    item.quantity, item.unitPrice, item.totalPrice, item.imageUrl
                ]);
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Order placed successfully.',
                data: { order: { ...order, items: resolvedItems } }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    /**
     * GET /api/orders — current user's order history
     */
    getMine: async (req, res, next) => {
        try {
            const ordersResult = await query(
                'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
                [req.user.id]
            );

            const orders = ordersResult.rows;
            if (orders.length > 0) {
                const itemsResult = await query(
                    'SELECT * FROM order_items WHERE order_id = ANY($1::uuid[])',
                    [orders.map(o => o.id)]
                );
                for (const order of orders) {
                    order.items = itemsResult.rows.filter(i => i.order_id === order.id);
                }
            }

            res.status(200).json({ success: true, data: { orders } });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/orders/track/:orderNumber?email=
     * Public order tracking — requires matching email for guest safety.
     */
    track: async (req, res, next) => {
        try {
            const { orderNumber } = req.params;
            const { email } = req.query;

            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required to track an order.' });
            }

            const result = await query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            const order = result.rows[0];
            const orderEmail = order.shipping_address && order.shipping_address.email;

            if (!orderEmail || orderEmail.toLowerCase() !== String(email).toLowerCase()) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
            order.items = itemsResult.rows;

            res.status(200).json({ success: true, data: { order } });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = ordersController;
