const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all prescriptions with their items
router.get('/', verifyToken, (req, res) => {
    db.query(
        `SELECT p.id, p.patient_name, p.status, p.notes, p.created_at,
        u.name as pharmacist_name,
        m.name as medication_name,
        pi.quantity
        FROM prescriptions p
        JOIN users u ON p.pharmacist_id = u.id
        JOIN prescription_items pi ON p.id = pi.prescription_id
        JOIN medications m ON pi.medication_id = m.id
        ORDER BY p.created_at DESC`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        }
    );
});

// Add a new prescription with items
router.post('/', verifyToken, (req, res) => {
    const { patient_name, notes, items } = req.body;
    const pharmacist_id = req.user.id;

    console.log('Body received:', req.body);
    console.log('Pharmacist ID:', pharmacist_id);

    if (!patient_name || !items || items.length === 0) {
        return res.status(400).json({ error: 'Patient name and at least one medication are required' });
    }

    db.query(
        'INSERT INTO prescriptions (patient_name, pharmacist_id, notes) VALUES (?, ?, ?)',
        [patient_name, pharmacist_id, notes || null],
        (err, result) => {
            if (err) {
                 console.log('Prescription insert error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const prescription_id = result.insertId;
            const itemValues = items.map(item => [prescription_id, item.medication_id, item.quantity]);

            db.query(
                'INSERT INTO prescription_items (prescription_id, medication_id, quantity) VALUES ?',
                [itemValues],
                (err) => {
                    if (err) {
                         console.log('Items insert error:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.status(201).json({ message: 'Prescription added', id: prescription_id });
                }
            );
        }
    );
});

// Update prescription status
router.put('/:id/status', verifyToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'dispensed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required: pending, dispensed or cancelled' });
    }

    db.query(
        'UPDATE prescriptions SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Prescription not found' });
            }
            res.json({ message: 'Prescription status updated' });
        }
    );
});

module.exports = router;