const express = require('express');
const router = express.Router();
const { getMyPolicies, getPolicyByNumber } = require('../controllers/policy.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/my', authenticate, getMyPolicies);
router.get('/:policyNumber', authenticate, getPolicyByNumber);

module.exports = router;
