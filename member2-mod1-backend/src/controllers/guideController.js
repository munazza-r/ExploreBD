const prisma = require("../db");

// POST /api/guides
// Add a new guide (used by admin/guide onboarding, but needed so we have data to search)
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
// Return every guide (used mainly for testing/admin views)
async function getGuides(req, res) {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: { rating: "desc" },
    });
    res.status(200).json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching guides" });
  }
}

// POST /api/guides/search
// The core feature: filter guides by location, language, rating, experience, budget
async function searchGuides(req, res) {
  try {
    const { location, language, minRating, minExperience, maxBudget } = req.body;

    const filters = {};

    if (location) {
      filters.location = { contains: location, mode: "insensitive" };
    }
    if (language) {
      filters.languages = { has: language };
    }
    if (minRating !== undefined) {
      filters.rating = { gte: Number(minRating) };
    }
    if (minExperience !== undefined) {
      filters.experience = { gte: Number(minExperience) };
    }
    if (maxBudget !== undefined) {
      filters.budget = { lte: Number(maxBudget) };
    }

    const guides = await prisma.guide.findMany({
      where: filters,
      orderBy: { rating: "desc" },
    });

    res.status(200).json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while searching guides" });
  }
}

// GET /api/guides/:id
// Fetch a single guide's full profile
async function getGuideDetails(req, res) {
  try {
    const { id } = req.params;
    const guide = await prisma.guide.findUnique({ where: { id } });

    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    res.status(200).json(guide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching guide details" });
  }
}

// PATCH /api/guides/:id/availability
// Update whether a guide is Available / Busy
async function updateAvailability(req, res) {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    if (!["Available", "Busy"].includes(availability)) {
      return res.status(400).json({ error: "availability must be 'Available' or 'Busy'" });
    }

    const guide = await prisma.guide.update({
      where: { id },
      data: { availability },
    });

    res.status(200).json({ response: "Availability Updated", guide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while updating availability" });
  }
}

module.exports = {
  addGuide,
  getGuides,
  searchGuides,
  getGuideDetails,
  updateAvailability,
};
