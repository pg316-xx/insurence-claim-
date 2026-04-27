const express = require('express');
const router = express.Router();
const { getAllHospitals, getNetworkHospitals } = require('../controllers/hospital.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, getAllHospitals);
router.get('/network', authenticate, getNetworkHospitals);

module.exports = router;
