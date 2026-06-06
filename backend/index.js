const express = require('express');
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const supplierRoutes = require('./routes/suppliers');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/suppliers', supplierRoutes);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});