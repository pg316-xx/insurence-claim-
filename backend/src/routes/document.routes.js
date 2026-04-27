const express = require('express');
const router = express.Router();
const { uploadDocument, getDocumentsByClaim } = require('../controllers/document.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.post('/upload', authenticate, upload.single('file'), uploadDocument);
router.get('/:claimId', authenticate, getDocumentsByClaim);

module.exports = router;
