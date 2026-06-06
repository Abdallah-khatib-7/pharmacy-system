const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all medications with ingredient name
router.get('/', verifyToken, (req, res) => {
    db.query(
        `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock, m.expiry,
        ai.name as ingredient_name
        FROM medications m
        JOIN active_ingredients ai ON m.ingredient_id = ai.id
        ORDER BY m.brand_name ASC`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

// Add a medication
router.post('/', verifyToken, (req, res) => {
    const { ingredient_id, brand_name, dosage, form, stock, expiry } = req.body;

    if (!ingredient_id || !brand_name || !dosage || !form || !stock || !expiry) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.query(
        'INSERT INTO medications (ingredient_id, brand_name, dosage, form, stock, expiry) VALUES (?, ?, ?, ?, ?, ?)',
        [ingredient_id, brand_name, dosage, form, stock, expiry],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Medication added', id: result.insertId });
        }
    );
});

// Update a medication
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { ingredient_id, brand_name, dosage, form, stock, expiry } = req.body;

    if (!ingredient_id || !brand_name || !dosage || !form || !stock || !expiry) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.query(
        'UPDATE medications SET ingredient_id=?, brand_name=?, dosage=?, form=?, stock=?, expiry=? WHERE id=?',
        [ingredient_id, brand_name, dosage, form, stock, expiry, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Medication not found' });
            res.json({ message: 'Medication updated' });
        }
    );
});

// Delete a medication
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM medications WHERE id = ?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Medication not found' });
            res.json({ message: 'Medication deleted' });
        }
    );
});

// Low stock alerts
router.get('/alerts/low-stock', verifyToken, (req, res) => {
    db.query(
        `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock, m.expiry,
        ai.name as ingredient_name
        FROM medications m
        JOIN active_ingredients ai ON m.ingredient_id = ai.id
        WHERE m.stock <= 15
        ORDER BY m.stock ASC`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

// Expiring soon alerts
router.get('/alerts/expiring-soon', verifyToken, (req, res) => {
    db.query(
        `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock, m.expiry,
        ai.name as ingredient_name
        FROM medications m
        JOIN active_ingredients ai ON m.ingredient_id = ai.id
        WHERE m.expiry <= DATE_ADD(NOW(), INTERVAL 90 DAY) AND m.expiry >= NOW()
        ORDER BY m.expiry ASC`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

module.exports = router;