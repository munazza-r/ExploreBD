const express = require('express');
const router = express.Router();

let currentProfile = {
  id: 'guide_101',
  name: 'Md. Muntasir Rahman',
  location: 'Dhaka, Bangladesh',
  languages: ['Bengali', 'English', 'Hindi'],
  bio: "Certified nature and heritage guide with 8+ years exploring Bangladesh's most iconic destinations — from the Sundarbans mangrove forest to the ancient mosque city of Bagerhat and the hill tracts of Bandarban. Passionate about authentic, sustainable tourism.",
  hourlyRate: 650,
  platformFeePercent: 12,
  toursDone: 142,
  avgRating: 4.9,
  repeatClientRate: 78,
  isPublic: true,
  isVerifiedGuide: true,
  isTopRated: true,
  specialties: ['Sundarbans', 'Bagerhat', 'Cox\'s Bazar', 'Bandarban', 'Rangamati', 'Sreemangal', 'Old Dhaka', 'River Cruises'],
  availableDays: ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  startTime: '10:00 A.M',
  endTime: '06:00 P.M'
};

// GET /api/guide/profile
router.get('/profile', (req, res) => {
  res.json(currentProfile);
});

// PUT /api/guide/profile
router.put('/profile', (req, res) => {
  currentProfile = {
    ...currentProfile,
    ...req.body
  };
  res.json({ message: 'Profile updated successfully!', profile: currentProfile });
});

module.exports = router;
