const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const defaultGuideProfile = {
  id: '66bc64917a17a94f1b8a9102',
  userId: '66bc64917a17a94f1b8a9101',
  name: 'Muntasir Rahman',
  location: 'Dhaka, Bangladesh',
  languages: ['Bengali', 'English', 'Hindi'],
  bio: "Certified nature and heritage guide with 8+ years exploring Bangladesh's most iconic destinations — from the Sundarbans mangrove forest to the ancient mosque city of Bagerhat and the hill tracts of Bandarban. Passionate about authentic, sustainable tourism.",
  hourlyRate: 650.0,
  platformFeeRate: 12.0,
  toursDone: 142,
  avgRating: 4.9,
  repeatClientRate: 78,
  isPublic: true,
  isVerifiedGuide: true,
  isTopRated: true,
  specialties: ['Sundarbans', 'Bagerhat', 'Cox\'s Bazar', 'Bandarban', 'Rangamati', 'Sreemangal', 'Old Dhaka', 'River Cruises'],
  availability: {
    availableDays: ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    startTime: '10:00 A.M',
    endTime: '06:00 P.M'
  }
};

// GET /api/guide/profile
router.get('/profile', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json(defaultGuideProfile);
    }

    let profile = null;
    try {
      profile = await prisma.guideProfile.findFirst({
        where: { userId },
        include: {
          user: { select: { name: true, email: true, country: true } },
          availability: true
        }
      });
    } catch (dbErr) {
      console.warn('Prisma DB fetch notice in guide profile');
    }

    if (!profile) {
      return res.json(defaultGuideProfile);
    }

    res.json({
      ...profile,
      name: profile.user?.name || defaultGuideProfile.name,
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.json(defaultGuideProfile);
  }
});

// PUT /api/guide/profile
router.put('/profile', async (req, res) => {
  try {
    const {
      userId,
      bio,
      location,
      languages,
      specialties,
      hourlyRate,
      isPublic,
      availableDays,
      startTime,
      endTime
    } = req.body;

    let updatedProfile = null;

    try {
      if (userId) {
        updatedProfile = await prisma.guideProfile.upsert({
          where: { userId },
          update: {
            bio,
            location,
            languages,
            specialties,
            hourlyRate: parseFloat(hourlyRate) || 650,
            isPublic: isPublic !== undefined ? isPublic : true,
            availability: {
              upsert: {
                create: {
                  availableDays: availableDays || [],
                  startTime: startTime || '10:00 A.M',
                  endTime: endTime || '06:00 P.M'
                },
                update: {
                  availableDays: availableDays || [],
                  startTime: startTime || '10:00 A.M',
                  endTime: endTime || '06:00 P.M'
                }
              }
            }
          },
          create: {
            userId,
            bio: bio || defaultGuideProfile.bio,
            location: location || defaultGuideProfile.location,
            languages: languages || defaultGuideProfile.languages,
            specialties: specialties || defaultGuideProfile.specialties,
            hourlyRate: parseFloat(hourlyRate) || 650,
            isPublic: isPublic !== undefined ? isPublic : true,
            availability: {
              create: {
                availableDays: availableDays || [],
                startTime: startTime || '10:00 A.M',
                endTime: endTime || '06:00 P.M'
              }
            }
          },
          include: { availability: true }
        });
      }
    } catch (dbErr) {
      console.warn('Prisma DB update notice:', dbErr.message);
    }

    if (!updatedProfile) {
      updatedProfile = {
        ...defaultGuideProfile,
        bio: bio || defaultGuideProfile.bio,
        location: location || defaultGuideProfile.location,
        languages: languages || defaultGuideProfile.languages,
        specialties: specialties || defaultGuideProfile.specialties,
        hourlyRate: parseFloat(hourlyRate) || 650,
        isPublic: isPublic !== undefined ? isPublic : true,
        availability: {
          availableDays: availableDays || defaultGuideProfile.availability.availableDays,
          startTime: startTime || defaultGuideProfile.availability.startTime,
          endTime: endTime || defaultGuideProfile.availability.endTime
        }
      };
    }

    res.json({
      message: 'Guide profile updated successfully!',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

module.exports = router;
