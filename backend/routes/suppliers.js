const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all suppliers
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM suppliers', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Add a supplier
router.post('/', verifyToken, (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Supplier name is required' });
    }

    db.query(
        'INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)',
        [name, contact_person || null, phone || null, email || null, address || null],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Supplier added', id: result.insertId });
        }
    );
});

// Update a supplier
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { name, contact_person, phone, email, address } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Supplier name is required' });
    }

    db.query(
        'UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE id = ?',
        [name, contact_person || null, phone || null, email || null, address || null, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Supplier not found' });
            }
            res.json({ message: 'Supplier updated' });
        }
    );
});

// Delete a supplier
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM suppliers WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Supplier not found' });
            }
            res.json({ message: 'Supplier deleted' });
        }
    );
});

module.exports = router;