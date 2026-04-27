const express = require('express');
const router = express.Router();
const { 
  createClaim, 
  getMyClaims, 
  getClaimQueue, 
  getAllClaims, 
  getClaimById, 
  updateClaimStatus 
} = require('../controllers/claim.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post('/', authenticate, authorize(['CUSTOMER', 'HOSPITAL']), createClaim);
router.get('/my', authenticate, authorize(['CUSTOMER', 'HOSPITAL']), getMyClaims);
router.get('/queue', authenticate, authorize(['TPA', 'ADMIN']), getClaimQueue);
router.get('/all', authenticate, authorize(['ADMIN', 'TPA']), getAllClaims);
router.get('/:id', authenticate, getClaimById);
router.patch('/:id/status', authenticate, authorize(['TPA', 'ADMIN']), updateClaimStatus);

module.exports = router;
