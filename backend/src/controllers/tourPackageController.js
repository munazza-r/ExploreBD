const prisma = require("../prisma");

// Finds the logged-in guide's own Guide record (their profile must already exist - Phase 2)
async function findMyGuideRecord(req, res) {
  const guide = await prisma.guide.findUnique({ where: { userId: req.user.id } });
  if (!guide) {
    res.status(404).json({ error: "Create your guide profile first (PUT /api/guides/me) before adding packages." });
    return null;
  }
  return guide;
}

function formatPlaces(places) {
  return Array.isArray(places)
    ? places.map((p) => ({ place: String(p.place || "").trim(), day: parseInt(p.day, 10) || 1 }))
    : [];
}

// POST /api/tour-packages - logged-in guide creates a package
async function createPackage(req, res) {
  try {
    const guide = await findMyGuideRecord(req, res);
    if (!guide) return;

    const { title, description, price, duration, places, coverPhoto, status } = req.body;
    if (!title || price == null || !duration) {
      return res.status(400).json({ error: "Title, Price, and Duration are required." });
    }

    const newPackage = await prisma.tourPackage.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : "",
        price: parseFloat(price),
        duration: parseInt(duration, 10),
        places: formatPlaces(places),
        coverPhoto: coverPhoto || null,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        guideId: guide.id,
      },
    });
    return res.status(201).json(newPackage);
  } catch (error) {
    console.error("Create Package Error:", error);
    return res.status(500).json({ error: "Failed to create tour package" });
  }
}

// GET /api/tour-packages - public browse (tourists see only PUBLISHED by default)
async function getPackages(req, res) {
  try {
    const { guideId, status } = req.query;
    const filters = {};
    if (guideId) filters.guideId = guideId;
    filters.status = status || "PUBLISHED";

    const packages = await prisma.tourPackage.findMany({
      where: filters,
      include: { guide: { select: { name: true, imageUrl: true, rating: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(packages);
  } catch (error) {
    console.error("Fetch Packages Error:", error);
    return res.status(500).json({ error: "Failed to fetch tour packages" });
  }
}

// GET /api/tour-packages/mine - logged-in guide's own packages (drafts included)
async function getMyPackages(req, res) {
  try {
    const guide = await findMyGuideRecord(req, res);
    if (!guide) return;
    const packages = await prisma.tourPackage.findMany({
      where: { guideId: guide.id },
      orderBy: { createdAt: "desc" },
    });
    return res.json(packages);
  } catch (error) {
    console.error("Fetch My Packages Error:", error);
    return res.status(500).json({ error: "Failed to fetch your tour packages" });
  }
}

// GET /api/tour-packages/:id
async function getPackageById(req, res) {
  try {
    const pkg = await prisma.tourPackage.findUnique({
      where: { id: req.params.id },
      include: { guide: { select: { name: true, imageUrl: true, rating: true } } },
    });
    if (!pkg) return res.status(404).json({ error: "Tour package not found" });
    return res.json(pkg);
  } catch (error) {
    console.error("Fetch Single Package Error:", error);
    return res.status(500).json({ error: "Failed to fetch tour package" });
  }
}

// PUT /api/tour-packages/:id - only the owning guide can edit
async function updatePackage(req, res) {
  try {
    const guide = await findMyGuideRecord(req, res);
    if (!guide) return;

    const existing = await prisma.tourPackage.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Tour package not found" });
    if (existing.guideId !== guide.id) {
      return res.status(403).json({ error: "You can only edit your own tour packages." });
    }

    const { title, description, price, duration, places, coverPhoto, status } = req.body;
    const updatedPackage = await prisma.tourPackage.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price != null && { price: parseFloat(price) }),
        ...(duration != null && { duration: parseInt(duration, 10) }),
        ...(places && { places: formatPlaces(places) }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(status && { status }),
      },
    });
    return res.json(updatedPackage);
  } catch (error) {
    console.error("Update Package Error:", error);
    return res.status(500).json({ error: "Failed to update tour package" });
  }
}

// DELETE /api/tour-packages/:id - only the owning guide can delete
async function deletePackage(req, res) {
  try {
    const guide = await findMyGuideRecord(req, res);
    if (!guide) return;

    const existing = await prisma.tourPackage.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Tour package not found" });
    if (existing.guideId !== guide.id) {
      return res.status(403).json({ error: "You can only delete your own tour packages." });
    }

    await prisma.tourPackage.delete({ where: { id: req.params.id } });
    return res.json({ message: "Tour package deleted successfully" });
  } catch (error) {
    console.error("Delete Package Error:", error);
    return res.status(500).json({ error: "Failed to delete tour package" });
  }
}

module.exports = { createPackage, getPackages, getMyPackages, getPackageById, updatePackage, deletePackage };