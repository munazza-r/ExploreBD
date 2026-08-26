const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploadMiddleware');
const {
  submitVerification,
  getAllVerifications,
  updateVerificationStatus,
  getVerificationStatus
} = require('../controllers/verificationController');

router.post('/submit', upload.fields([
  { name: 'studentIdCard', maxCount: 1 },
  { name: 'nidOrPassport', maxCount: 1 }
]), submitVerification);

// Admin routes
router.get('/all', getAllVerifications);
router.patch('/:id/status', updateVerificationStatus);

// User polling route
router.get('/status/:id', getVerificationStatus);

module.exports = router;