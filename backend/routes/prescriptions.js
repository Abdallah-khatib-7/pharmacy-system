const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all prescriptions
router.get('/', verifyToken, (req, res) => {
    db.query(
        `SELECT p.id, p.patient_name, p.doctor_name, p.prescription_date,
        p.diagnosis, p.insurance, p.insurance_company, p.insurance_coverage,
        p.hospitalized, p.status, p.notes, p.created_at,
        u.name as pharmacist_name,
        m.brand_name as medication_name,
        m.selling_price,
        ai.name as ingredient_name,
        pi.quantity, pi.instructions
        FROM prescriptions p
        JOIN users u ON p.pharmacist_id = u.id
        LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
        LEFT JOIN medications m ON pi.medication_id = m.id
        LEFT JOIN active_ingredients ai ON m.ingredient_id = ai.id
        ORDER BY p.created_at DESC`,
        (err, results) => {
            if (err) {
                console.log('Prescriptions error:', err)
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        }
    );
});

// Create prescription
router.post('/', verifyToken, (req, res) => {
    const {
        patient_name, doctor_name, prescription_date, diagnosis,
        insurance, insurance_company, insurance_coverage,
        hospitalized, notes, items
    } = req.body;
    const pharmacist_id = req.user.id;

    if (!patient_name || !items || items.length === 0) {
        return res.status(400).json({ error: 'Patient name and at least one medication are required' });
    }

    // Check stock for all items first
    const stockChecks = items.map(item => new Promise((resolve, reject) => {
        db.query(
            'SELECT stock, brand_name FROM medications WHERE id = ?',
            [item.medication_id],
            (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return reject(new Error('Medication not found'));
                if (results[0].stock < item.quantity) {
                    return reject(new Error(`Insufficient stock for ${results[0].brand_name}. Available: ${results[0].stock}`));
                }
                resolve();
            }
        );
    }));

    Promise.all(stockChecks)
        .then(() => {
            db.query(
                `INSERT INTO prescriptions 
                (patient_name, doctor_name, prescription_date, diagnosis, insurance, 
                insurance_company, insurance_coverage, hospitalized, notes, pharmacist_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    patient_name,
                    doctor_name || null,
                    prescription_date || null,
                    diagnosis || null,
                    insurance || false,
                    insurance_company || null,
                    insurance_coverage || 0,
                    hospitalized || false,
                    notes || null,
                    pharmacist_id
                ],
                (err, result) => {
                    if (err) return res.status(500).json({ error: 'Database error' });

                    const prescription_id = result.insertId;
                    const itemValues = items.map(item => [
                        prescription_id,
                        item.medication_id,
                        item.quantity,
                        item.instructions || null
                    ]);

                    db.query(
                        'INSERT INTO prescription_items (prescription_id, medication_id, quantity, instructions) VALUES ?',
                        [itemValues],
                        (err2) => {
                            if (err2) return res.status(500).json({ error: 'Database error' });
                            res.status(201).json({ message: 'Prescription created', id: prescription_id });
                        }
                    );
                }
            );
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
});

// Update status — deduct stock when dispensed
router.put('/:id/status', verifyToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'dispensed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Valid status required' });
    }

    db.query(
        'UPDATE prescriptions SET status = ? WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Prescription not found' });

            if (status === 'dispensed') {
                db.query(
                    'SELECT medication_id, quantity FROM prescription_items WHERE prescription_id = ?',
                    [id],
                    (err2, items) => {
                        if (err2) return res.status(500).json({ error: 'Database error' });

                        const updates = items.map(item => new Promise((resolve, reject) => {
                            db.query(
                                'UPDATE medications SET stock = stock - ? WHERE id = ?',
                                [item.quantity, item.medication_id],
                                (err3) => err3 ? reject(err3) : resolve()
                            );
                        }));

                        Promise.all(updates)
                            .then(() => res.json({ message: 'Prescription dispensed and stock updated' }))
                            .catch(() => res.status(500).json({ error: 'Stock update failed' }));
                    }
                );
            } else {
                res.json({ message: 'Status updated' });
            }
        }
    );
});

module.exports = router;