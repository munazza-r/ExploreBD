const prisma = require("../prisma");

// ---- Search/filter endpoints (unchanged from Member 2's original feature) ----

// POST /api/guides - add a guide directly (mainly for seeding/testing)
async function addGuide(req, res) {
  try {
    const { name, location, languages, rating, experience, budget, availability, verified, imageUrl } = req.body;
    if (!name || !location || !budget) {
      return res.status(400).json({ error: "name, location and budget are required" });
    }
    const guide = await prisma.guide.create({
      data: {
        name,
        location,
        languages: languages || [],
        rating: rating ?? 0,
        experience: experience ?? 0,
        budget,
        availability: availability || "Available",
        verified: verified ?? false,
        imageUrl: imageUrl || null,
      },
    });
    res.status(201).json({ response: "Guide Added Successfully", guide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while adding the guide" });
  }
}

// GET /api/guides
async function getGuides(req, res) {
  try {
    const guides = await prisma.guide.findMany({
      where: { isPublic: true },
      orderBy: { rating: "desc" },
    });
    res.status(200).json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching guides" });
  }
}

// POST /api/guides/search
async function searchGuides(req, res) {
  try {
    const { location, languages, minRating, minExperience, maxBudget } = req.body;
    const filters = { isPublic: true };

    if (location) filters.location = { contains: location, mode: "insensitive" };
    if (languages && languages.length > 0) filters.languages = { hasSome: languages };
    if (minRating !== undefined) filters.rating = { gte: Number(minRating) };
    if (minExperience !== undefined) filters.experience = { gte: Number(minExperience) };
    if (maxBudget !== undefined) filters.budget = { lte: Number(maxBudget) };

    const guides = await prisma.guide.findMany({ where: filters, orderBy: { rating: "desc" } });
    res.status(200).json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while searching guides" });
  }
}

// GET /api/guides/:id
async function getGuideDetails(req, res) {
  try {
    const { id } = req.params;
    const guide = await prisma.guide.findUnique({ where: { id } });
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    res.status(200).json(guide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching guide details" });
  }
}

// PATCH /api/guides/:id/availability
async function updateAvailability(req, res) {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    if (!["Available", "Busy"].includes(availability)) {
      return res.status(400).json({ error: "availability must be 'Available' or 'Busy'" });
    }
    const guide = await prisma.guide.update({ where: { id }, data: { availability } });
    res.status(200).json({ response: "Availability Updated", guide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while updating availability" });
  }
}

// ---- New: profile-management endpoints (Member 3's feature, now merged in) ----
// These require a real logged-in GUIDE (via requireAuth + requireGuide middleware).

// GET /api/guides/me - the logged-in guide views their own profile
async function getMyProfile(req, res) {
  try {
    const guide = await prisma.guide.findUnique({ where: { userId: req.user.id } });
    if (!guide) return res.status(404).json({ error: "No guide profile yet - create one with PUT /api/guides/me" });
    res.status(200).json(guide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching your profile" });
  }
}

// PUT /api/guides/me - the logged-in guide creates or updates their own profile
async function updateMyProfile(req, res) {
  try {
    const {
      location, languages, bio, budget, experience, imageUrl,
      platformFeePercent, isPublic, specialties, availableDays, startTime, endTime,
    } = req.body;

    const guide = await prisma.guide.upsert({
      where: { userId: req.user.id },
      update: {
        location, languages, bio, budget, experience, imageUrl,
        platformFeePercent, isPublic, specialties, availableDays, startTime, endTime,
      },
      create: {
        userId: req.user.id,
        name: req.user.name,
        location: location || "Bangladesh",
        languages: languages || ["Bengali"],
        bio: bio || "",
        budget: budget || 500,
        experience: experience || 0,
        imageUrl: imageUrl || null,
        platformFeePercent: platformFeePercent ?? 12,
        isPublic: isPublic ?? true,
        specialties: specialties || [],
        availableDays: availableDays || [],
        startTime: startTime || "10:00 A.M",
        endTime: endTime || "06:00 P.M",
      },
    });

    res.status(200).json({ response: "Profile saved", guide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while saving your profile" });
  }
}

module.exports = {
  addGuide, getGuides, searchGuides, getGuideDetails, updateAvailability,
  getMyProfile, updateMyProfile,
};
