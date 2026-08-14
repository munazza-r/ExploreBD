const express = require('express');
const mongoose = require('mongoose');
const GuideProfile = require('../models/GuideProfile');
const User = require('../models/User');
const { usersById, guideProfilesByUserId, saveUser, saveGuideProfile } = require('../store/memoryStore');
const { requireAuth, requireGuide } = require('../middleware/auth');

const router = express.Router();
const ALL_DAYS = new Set(['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);

router.use(requireAuth, requireGuide);

function stringList(value) {
  const values = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(values.map(item => String(item).trim()).filter(Boolean))].slice(0, 20);
}

function defaultProfile(user) {
  const location = user.city
    ? `${user.city}, ${user.country || 'Bangladesh'}`
    : (user.country || 'Bangladesh');

  return {
    userId: user.id,
    name: user.name,
    location,
    languages: stringList(user.primaryLanguage || 'Bengali'),
    bio: '',
    hourlyRate: 500,
    platformFeePercent: 12,
    toursDone: 0,
    avgRating: 0,
    repeatClientRate: 0,
    isPublic: true,
    isVerifiedGuide: false,
    isTopRated: false,
    specialties: [],
    availableDays: [],
    startTime: '10:00 A.M',
    endTime: '06:00 P.M',
    avatarUrl: ''
  };
}

function serializeProfile(profile, user) {
  const value = typeof profile.toObject === 'function' ? profile.toObject() : { ...profile };
  return {
    ...defaultProfile(user),
    ...value,
    id: value._id ? String(value._id) : value.id,
    userId: user.id,
    name: value.name || user.name
  };
}

router.get('/profile', async (req, res) => {
  try {
    const memoryProfile = guideProfilesByUserId.get(req.user.id);
    if (memoryProfile) return res.json(serializeProfile(memoryProfile, req.user));

    if (mongoose.connection.readyState === 1 && !usersById.has(req.user.id)) {
      const profile = await GuideProfile.findOne({ userId: req.user.id });
      if (profile) return res.json(serializeProfile(profile, req.user));
    }

    return res.json(defaultProfile(req.user));
  } catch (error) {
    console.error('Fetch guide profile error:', error);
    return res.status(500).json({ error: 'Could not load the guide profile' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const name = String(req.body.name || req.user.name).trim().slice(0, 100);
    const hourlyRateValue = Number(req.body.hourlyRate);
    const profileData = {
      name: name || req.user.name,
      location: String(req.body.location || '').trim().slice(0, 150),
      languages: stringList(req.body.languages),
      bio: String(req.body.bio || '').trim().slice(0, 2000),
      hourlyRate: Number.isFinite(hourlyRateValue) && hourlyRateValue >= 0 ? hourlyRateValue : 500,
      specialties: stringList(req.body.specialties),
      avatarUrl: String(req.body.avatarUrl || '').slice(0, 2_000_000),
      isPublic: req.body.isPublic !== false,
      availableDays: stringList(req.body.availableDays).filter(day => ALL_DAYS.has(day)),
      startTime: String(req.body.startTime || '10:00 A.M').slice(0, 20),
      endTime: String(req.body.endTime || '06:00 P.M').slice(0, 20)
    };

    let profile;
    const memoryUser = usersById.get(req.user.id);
    if (memoryUser || mongoose.connection.readyState !== 1) {
      if (memoryUser) {
        memoryUser.name = profileData.name;
        saveUser(memoryUser);
      }
      profile = {
        ...defaultProfile({ ...req.user, name: profileData.name }),
        ...guideProfilesByUserId.get(req.user.id),
        ...profileData,
        userId: req.user.id,
        updatedAt: new Date()
      };
      saveGuideProfile(profile);
    } else {
      await User.findByIdAndUpdate(req.user.id, { name: profileData.name });
      profile = await GuideProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileData, $setOnInsert: { userId: req.user.id } },
        { new: true, upsert: true, runValidators: true }
      );
    }

    return res.json({
      message: 'Guide profile updated successfully',
      profile: serializeProfile(profile, { ...req.user, name: profileData.name })
    });
  } catch (error) {
    console.error('Update guide profile error:', error);
    return res.status(500).json({ error: 'Could not update the guide profile' });
  }
});

module.exports = router;
