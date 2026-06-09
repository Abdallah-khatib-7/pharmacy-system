const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get low stock alerts (excluding dismissed)
router.get('/low-stock', verifyToken, (req, res) => {
    const user_id = req.user.id;
    db.query(
        `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock,
        m.purchase_price, m.selling_price,
        ai.name as ingredient_name,
        s.name as supplier_name, s.id as supplier_id,
        s.phone as supplier_phone
        FROM medications m
        JOIN active_ingredients ai ON m.ingredient_id = ai.id
        LEFT JOIN suppliers s ON m.supplier_id = s.id
        WHERE m.stock <= 15
        AND m.id NOT IN (
            SELECT medication_id FROM dismissed_alerts
            WHERE alert_type = 'low_stock'
            AND dismissed_by = ?
            AND remind_at > CURDATE()
        )
        ORDER BY m.stock ASC`,
        [user_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

// Get expiry alerts (excluding dismissed)
router.get('/expiring', verifyToken, (req, res) => {
    const user_id = req.user.id;
    db.query(
        `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock,
        m.expiry, ai.name as ingredient_name,
        s.name as supplier_name, s.id as supplier_id,
        s.phone as supplier_phone,
        DATEDIFF(m.expiry, CURDATE()) as days_remaining
        FROM medications m
        JOIN active_ingredients ai ON m.ingredient_id = ai.id
        LEFT JOIN suppliers s ON m.supplier_id = s.id
        WHERE m.expiry <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        AND m.expiry >= CURDATE()
        AND m.id NOT IN (
            SELECT medication_id FROM dismissed_alerts
            WHERE alert_type = 'expiry'
            AND dismissed_by = ?
            AND remind_at > CURDATE()
        )
        ORDER BY m.expiry ASC`,
        [user_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(results);
        }
    );
});

// Dismiss an alert
router.post('/dismiss', verifyToken, (req, res) => {
    const { medication_id, alert_type, days } = req.body;
    const dismissed_by = req.user.id;

    if (!medication_id || !alert_type || !days) {
        return res.status(400).json({ error: 'medication_id, alert_type and days are required' });
    }

    // Calculate remind_at date
    db.query(
        `INSERT INTO dismissed_alerts (medication_id, alert_type, dismissed_by, remind_at)
        VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY))
        ON DUPLICATE KEY UPDATE remind_at = DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
        [medication_id, alert_type, dismissed_by, days, days],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Alert dismissed' });
        }
    );
});

module.exports = router;