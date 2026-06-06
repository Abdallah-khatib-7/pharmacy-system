const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all active ingredients
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM active_ingredients ORDER BY name ASC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Add an active ingredient
router.post('/', verifyToken, (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Ingredient name is required' });
    }

    db.query(
        'INSERT INTO active_ingredients (name) VALUES (?)',
        [name],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Ingredient already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Ingredient added', id: result.insertId });
        }
    );
});

// Search medications by active ingredient
router.get('/:id/medications', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock, m.expiry,
        ai.name as ingredient_name
        FROM medications m
        JOIN active_ingredients ai ON m.ingredient_id = ai.id
        WHERE m.ingredient_id = ?
        ORDER BY m.brand_name ASC`,
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        }
    );
});

// Search ingredients by name
router.get('/search', verifyToken, (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    db.query(
        `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock, m.expiry,
        ai.name as ingredient_name
        FROM medications m
        JOIN active_ingredients ai ON m.ingredient_id = ai.id
        WHERE ai.name LIKE ?
        ORDER BY m.brand_name ASC`,
        [`%${name}%`],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

module.exports = router;