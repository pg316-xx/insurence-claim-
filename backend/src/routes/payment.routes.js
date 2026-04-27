const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Claim settlements (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), paymentController.recordPayment);

// Premium payments (Customer only)
router.get('/schedule', authenticate, paymentController.getPremiumSchedule);
router.post('/pay', authenticate, paymentController.payPremium);

module.exports = router;
