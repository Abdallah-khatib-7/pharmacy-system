const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pharmacy'
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

app.get('/api/medications', (req, res) => {
    db.query('SELECT * FROM medications', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});
  
app.post('/api/medications', (req, res) => {
    const { name, stock, expiry } = req.body;

    if (!name || !stock || !expiry) {
        res.status(400).json({ error: 'Name, stock and expiry are required' });
        return;
    }

    db.query(
        'INSERT INTO medications (name, stock, expiry) VALUES (?, ?, ?)',
        [name, stock, expiry],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.status(201).json({ message: 'Medication added', id: result.insertId });
        }
    );
});


app.put('/api/medications/:id', (req, res) => {
    const { id } = req.params;
    const { name, stock, expiry } = req.body;

    if (!name || !stock || !expiry) {
        res.status(400).json({ error: 'Name, stock and expiry are required' });
        return;
    }

    db.query(
        'UPDATE medications SET name = ?, stock = ?, expiry = ? WHERE id = ?',
        [name, stock, expiry, id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Medication not found' });
                return;
            }
            res.json({ message: 'Medication updated' });
        }
    );
});


app.delete('/api/medications/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM medications WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Medication not found' });
                return;
            }
            res.json({ message: 'Medication deleted' });
        }
    );
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});