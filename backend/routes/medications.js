const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM medications', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

router.post('/', verifyToken, (req, res) => {
    const { name, stock, expiry } = req.body;

    if (!name || !stock || !expiry) {
        return res.status(400).json({ error: 'Name, stock and expiry are required' });
    }

    db.query(
        'INSERT INTO medications (name, stock, expiry) VALUES (?, ?, ?)',
        [name, stock, expiry],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Medication added', id: result.insertId });
        }
    );
});

router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { name, stock, expiry } = req.body;

    if (!name || !stock || !expiry) {
        return res.status(400).json({ error: 'Name, stock and expiry are required' });
    }

    db.query(
        'UPDATE medications SET name = ?, stock = ?, expiry = ? WHERE id = ?',
        [name, stock, expiry, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Medication not found' });
            }
            res.json({ message: 'Medication updated' });
        }
    );
});

router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM medications WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Medication not found' });
            }
            res.json({ message: 'Medication deleted' });
        }
    );
});

module.exports = router;