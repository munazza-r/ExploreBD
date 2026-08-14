const express = require('express');
const router = express.Router();

// Notice the 's' in middlewares and the full uploadMiddleware filename!
const upload = require('../middlewares/uploadMiddleware');
const { submitVerification } = require('../controllers/verificationController');

router.post('/submit', upload.fields([
  { name: 'studentIdCard', maxCount: 1 },
  { name: 'nidOrPassport', maxCount: 1 }
]), submitVerification);

module.exports = router;