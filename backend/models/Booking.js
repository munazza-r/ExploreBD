const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  initials: { type: String, required: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  verified: { type: Boolean, default: false }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  packageName: { type: String, required: true },
  destination: { type: String, required: true },
  meetingPoint: { type: String, required: true },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  travelers: { type: Number, default: 1, min: 1 },
  tourist: { type: personSchema, required: true },
  guide: { type: personSchema, required: true },
  payment: {
    status: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PAID' },
    provider: { type: String, default: 'bKash' },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    paidAt: { type: Date, required: true }
  },
  pass: {
    id: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'CHECKED_IN', 'REVOKED'], default: 'ACTIVE' },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null }
  }
}, { timestamps: true });

bookingSchema.index({ 'tourist.id': 1, createdAt: -1 });
bookingSchema.index({ 'guide.id': 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
