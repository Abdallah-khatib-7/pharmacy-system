const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Admin-only guard — reused across all routes in this file
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' })
    }
    next()
}

// Full pharmacist list with aggregate stats in a single query.
// Each row is one pharmacist — counts are pre-aggregated via subqueries so
// we don't do N+1 queries on the frontend.
router.get('/', verifyToken, adminOnly, (req, res) => {
    db.query(
        `SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.created_at,
            COALESCE(stats.total_prescriptions, 0)    AS total_prescriptions,
            COALESCE(stats.dispensed, 0)               AS dispensed,
            COALESCE(stats.cancelled, 0)               AS cancelled,
            COALESCE(stats.pending, 0)                 AS pending,
            COALESCE(stats.insured_patients, 0)        AS insured_patients,
            COALESCE(stats.hospitalized_patients, 0)   AS hospitalized_patients,
            COALESCE(stats.unique_patients, 0)         AS unique_patients,
            COALESCE(stats.total_revenue, 0)           AS total_revenue,
            COALESCE(stats.prescriptions_this_month, 0) AS prescriptions_this_month,
            COALESCE(stats.prescriptions_this_week, 0)  AS prescriptions_this_week
        FROM users u
        LEFT JOIN (
            SELECT
                p.pharmacist_id,
                COUNT(*)                                                        AS total_prescriptions,
                SUM(p.status = 'dispensed')                                     AS dispensed,
                SUM(p.status = 'cancelled')                                     AS cancelled,
                SUM(p.status = 'pending')                                       AS pending,
                SUM(p.insurance = 1)                                            AS insured_patients,
                SUM(p.hospitalized = 1)                                         AS hospitalized_patients,
                COUNT(DISTINCT p.patient_name)                                  AS unique_patients,
                COALESCE(SUM(
                    CASE WHEN p.status = 'dispensed'
                    THEN (SELECT SUM(pi2.quantity * m2.selling_price)
                          FROM prescription_items pi2
                          JOIN medications m2 ON pi2.medication_id = m2.id
                          WHERE pi2.prescription_id = p.id)
                    ELSE 0 END
                ), 0)                                                           AS total_revenue,
                SUM(MONTH(p.created_at) = MONTH(NOW()) AND YEAR(p.created_at) = YEAR(NOW())) AS prescriptions_this_month,
                SUM(YEARWEEK(p.created_at, 1) = YEARWEEK(NOW(), 1))            AS prescriptions_this_week
            FROM prescriptions p
            GROUP BY p.pharmacist_id
        ) stats ON u.id = stats.pharmacist_id
        WHERE u.role = 'pharmacist'
        ORDER BY stats.total_prescriptions DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' })
            res.json(results)
        }
    )
})

// Per-pharmacist deep profile:
// - last 10 prescriptions
// - top 5 most-prescribed medications
// - daily activity for the last 30 days (for the sparkline)
// - paid leave records
router.get('/:id/profile', verifyToken, adminOnly, (req, res) => {
    const { id } = req.params

    const recentPrescriptions = new Promise((resolve, reject) => {
        db.query(
            `SELECT p.id, p.patient_name, p.status, p.created_at, p.diagnosis,
                    p.insurance, p.insurance_company, p.hospitalized,
                    GROUP_CONCAT(m.brand_name ORDER BY m.brand_name SEPARATOR ', ') AS medications,
                    COALESCE(SUM(pi.quantity * m.selling_price), 0) AS prescription_value
             FROM prescriptions p
             LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
             LEFT JOIN medications m ON pi.medication_id = m.id
             WHERE p.pharmacist_id = ?
             GROUP BY p.id
             ORDER BY p.created_at DESC
             LIMIT 15`,
            [id],
            (err, rows) => err ? reject(err) : resolve(rows)
        )
    })

    const topMedications = new Promise((resolve, reject) => {
        db.query(
            `SELECT m.brand_name, ai.name AS ingredient, m.form, m.dosage,
                    SUM(pi.quantity) AS total_dispensed,
                    COUNT(DISTINCT p.id) AS times_prescribed
             FROM prescription_items pi
             JOIN prescriptions p ON pi.prescription_id = p.id
             JOIN medications m ON pi.medication_id = m.id
             JOIN active_ingredients ai ON m.ingredient_id = ai.id
             WHERE p.pharmacist_id = ? AND p.status = 'dispensed'
             GROUP BY m.id
             ORDER BY total_dispensed DESC
             LIMIT 8`,
            [id],
            (err, rows) => err ? reject(err) : resolve(rows)
        )
    })

    // Daily prescription count for the last 30 days — used for the activity chart
    const dailyActivity = new Promise((resolve, reject) => {
        db.query(
            `SELECT DATE(created_at) AS date, COUNT(*) AS count
             FROM prescriptions
             WHERE pharmacist_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date ASC`,
            [id],
            (err, rows) => err ? reject(err) : resolve(rows)
        )
    })

    const leaveRecords = new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM paid_leaves WHERE pharmacist_id = ? ORDER BY created_at DESC`,
            [id],
            (err, rows) => {
                // Table may not exist yet — return empty array gracefully
                if (err) return resolve([])
                resolve(rows)
            }
        )
    })

    Promise.all([recentPrescriptions, topMedications, dailyActivity, leaveRecords])
        .then(([prescriptions, medications, activity, leaves]) => {
            res.json({ prescriptions, medications, activity, leaves })
        })
        .catch(() => res.status(500).json({ error: 'Database error' }))
})

// Create a new pharmacist account (admin only)
router.post('/', verifyToken, adminOnly, async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' })
    }
    try {
        const hashed = await bcrypt.hash(password, 10)
        db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashed, 'pharmacist'],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' })
                    return res.status(500).json({ error: 'Database error' })
                }
                res.status(201).json({ message: 'Pharmacist created', id: result.insertId })
            }
        )
    } catch {
        res.status(500).json({ error: 'Server error' })
    }
})

// Deactivate / delete pharmacist
router.delete('/:id', verifyToken, adminOnly, (req, res) => {
    db.query('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'pharmacist'], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' })
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Pharmacist not found' })
        res.json({ message: 'Pharmacist removed' })
    })
})

module.exports = router
