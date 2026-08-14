const mongoose = require('mongoose');

const guideProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, default: 'Bangladesh' },
  languages: { type: [String], default: ['Bengali'] },
  bio: { type: String, default: '' },
  hourlyRate: { type: Number, default: 500 },
  platformFeePercent: { type: Number, default: 12 },
  toursDone: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  repeatClientRate: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  isVerifiedGuide: { type: Boolean, default: false },
  isTopRated: { type: Boolean, default: false },
  specialties: { type: [String], default: [] },
  availableDays: { type: [String], default: [] },
  startTime: { type: String, default: '10:00 A.M' },
  endTime: { type: String, default: '06:00 P.M' },
  avatarUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GuideProfile', guideProfileSchema);
