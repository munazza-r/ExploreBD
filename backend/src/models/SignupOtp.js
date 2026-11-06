const mongoose = require('mongoose');

const signupOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  otpHash: { type: String, required: true },
  passwordHash: { type: String, required: true },
  registration: { type: mongoose.Schema.Types.Mixed, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  lastSentAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SignupOtp', signupOtpSchema);
