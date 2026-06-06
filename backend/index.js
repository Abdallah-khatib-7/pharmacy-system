const express = require('express');
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const supplierRoutes = require('./routes/suppliers');
const prescriptionRoutes = require('./routes/prescriptions');
const ingredientRoutes = require('./routes/ingredients');
const cors = require('cors')

const app = express();
app.use(express.json());

app.use(cors())
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ingredients', ingredientRoutes);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});