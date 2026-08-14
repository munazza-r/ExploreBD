const mongoose = require('mongoose');

const guideProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, default: 'Md. Muntasir Rahman' },
  location: { type: String, default: 'Dhaka, Bangladesh' },
  languages: { type: [String], default: ['Bengali', 'English', 'Hindi'] },
  bio: { type: String, default: "Certified nature and heritage guide with 8+ years exploring Bangladesh's most iconic destinations." },
  hourlyRate: { type: Number, default: 650 },
  platformFeePercent: { type: Number, default: 12 },
  toursDone: { type: Number, default: 142 },
  avgRating: { type: Number, default: 4.9 },
  repeatClientRate: { type: Number, default: 78 },
  isPublic: { type: Boolean, default: true },
  isVerifiedGuide: { type: Boolean, default: true },
  isTopRated: { type: Boolean, default: true },
  specialties: { type: [String], default: ['Sundarbans', 'Bagerhat', 'Cox\'s Bazar', 'Bandarban', 'Old Dhaka'] },
  availableDays: { type: [String], default: ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
  startTime: { type: String, default: '10:00 A.M' },
  endTime: { type: String, default: '06:00 P.M' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GuideProfile', guideProfileSchema);
