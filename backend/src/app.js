const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth.routes');
const claimRoutes = require('./routes/claim.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const policyRoutes = require('./routes/policy.routes');
const documentRoutes = require('./routes/document.routes');
const paymentRoutes = require('./routes/payment.routes');

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Health Insurance Claim Processing System API' });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
