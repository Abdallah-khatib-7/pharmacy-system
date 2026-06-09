const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all orders with supplier and user info
router.get('/', verifyToken, (req, res) => {
    db.query(
        `SELECT o.id, o.status, o.notes, o.created_at,
        s.name as supplier_name,
        u.name as ordered_by_name,
        COUNT(oi.id) as item_count
        FROM orders o
        JOIN suppliers s ON o.supplier_id = s.id
        JOIN users u ON o.ordered_by = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

// Get single order with items
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.query(
        `SELECT o.id, o.status, o.notes, o.created_at,
        s.name as supplier_name, s.id as supplier_id,
        u.name as ordered_by_name
        FROM orders o
        JOIN suppliers s ON o.supplier_id = s.id
        JOIN users u ON o.ordered_by = u.id
        WHERE o.id = ?`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length === 0) return res.status(404).json({ error: 'Order not found' });

            const order = results[0];

            db.query(
                `SELECT oi.id, oi.quantity, oi.unit_price, oi.expiry, oi.notes,
                m.id as medication_id, m.brand_name, m.dosage, m.form,
                ai.name as ingredient_name
                FROM order_items oi
                JOIN medications m ON oi.medication_id = m.id
                JOIN active_ingredients ai ON m.ingredient_id = ai.id
                WHERE oi.order_id = ?`,
                [id],
                (err2, items) => {
                    if (err2) return res.status(500).json({ error: 'Database error' });
                    res.json({ ...order, items });
                }
            );
        }
    );
});

// Create new order
router.post('/', verifyToken, (req, res) => {
    const { supplier_id, notes, items } = req.body;
    const ordered_by = req.user.id;

    if (!supplier_id || !items || items.length === 0) {
        return res.status(400).json({ error: 'Supplier and at least one item are required' });
    }

    db.query(
        'INSERT INTO orders (supplier_id, ordered_by, notes) VALUES (?, ?, ?)',
        [supplier_id, ordered_by, notes || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            const order_id = result.insertId;
            const itemValues = items.map(item => [order_id, item.medication_id, item.quantity, item.unit_price]);

            db.query(
                'INSERT INTO order_items (order_id, medication_id, quantity, unit_price) VALUES ?',
                [itemValues],
                (err2) => {
                    if (err2) return res.status(500).json({ error: 'Database error' });
                    res.status(201).json({ message: 'Order created', id: order_id });
                }
            );
        }
    );
});

// Update order status
router.put('/:id/status', verifyToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'received', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Valid status required' });
    }

    db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });

            if (status === 'received') {
                db.query(
                    'SELECT medication_id, quantity FROM order_items WHERE order_id = ?',
                    [id],
                    (err2, items) => {
                        if (err2) return res.status(500).json({ error: 'Database error' });

                        const updates = items.map(item => new Promise((resolve, reject) => {
                            db.query(
                                'UPDATE medications SET stock = stock + ? WHERE id = ?',
                                [item.quantity, item.medication_id],
                                (err3) => err3 ? reject(err3) : resolve()
                            );
                        }));

                        Promise.all(updates)
                            .then(() => res.json({ message: 'Order received and stock updated' }))
                            .catch(() => res.status(500).json({ error: 'Stock update failed' }));
                    }
                );
            } else {
                res.json({ message: 'Order status updated' });
            }
        }
    );
});

// Update order items during purchase entry
router.put('/:id/items', verifyToken, (req, res) => {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Items are required' });
    }

    const updates = items.map(item => new Promise((resolve, reject) => {
        db.query(
            'UPDATE order_items SET quantity = ?, unit_price = ?, expiry = ?, notes = ? WHERE id = ? AND order_id = ?',
            [item.quantity, item.unit_price, item.expiry || null, item.notes || null, item.id, id],
            (err) => err ? reject(err) : resolve()
        );
    }));

    Promise.all(updates)
        .then(() => res.json({ message: 'Items updated' }))
        .catch(() => res.status(500).json({ error: 'Update failed' }));
});

// Get orders by supplier
router.get('/supplier/:supplier_id', verifyToken, (req, res) => {
    const { supplier_id } = req.params;
    db.query(
        `SELECT o.id, o.status, o.notes, o.created_at,
        u.name as ordered_by_name,
        COUNT(oi.id) as item_count
        FROM orders o
        JOIN users u ON o.ordered_by = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.supplier_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC`,
        [supplier_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

module.exports = router;