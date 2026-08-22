const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// CREATE a new tour package
router.post("/", async (req, res) => {
  try {
    const { title, description, price, duration, places, coverPhoto, status, guideId } = req.body;

    // Required fields validation
    if (!title || price == null || !duration || !guideId) {
      return res.status(400).json({ error: "Title, Price, Duration, and Guide ID are required." });
    }

    // Explicit type conversion for Prisma
    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration, 10);

    if (isNaN(parsedPrice) || isNaN(parsedDuration)) {
      return res.status(400).json({ error: "Price and Duration must be valid numbers." });
    }

    // Format embedded composite type array
    const formattedPlaces = Array.isArray(places)
      ? places.map((p) => ({
          place: String(p.place || "").trim(),
          day: parseInt(p.day, 10) || 1,
        }))
      : [];

    const newPackage = await prisma.tourPackage.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : "",
        price: parsedPrice,
        duration: parsedDuration,
        places: formattedPlaces,
        coverPhoto: coverPhoto || null,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        guideId,
      },
    });

    return res.status(201).json(newPackage);
  } catch (error) {
    console.error("Create Package Error:", error);
    return res.status(500).json({ error: "Failed to create tour package" });
  }
});

// READ all tour packages (optionally filter by guideId or status)
router.get("/", async (req, res) => {
  try {
    const { guideId, status } = req.query;

    const filters = {};
    if (guideId) filters.guideId = guideId;
    if (status) filters.status = status;

    const packages = await prisma.tourPackage.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });
    return res.json(packages);
  } catch (error) {
    console.error("Fetch Packages Error:", error);
    return res.status(500).json({ error: "Failed to fetch tour packages" });
  }
});

// READ one tour package by id
router.get("/:id", async (req, res) => {
  try {
    const pkg = await prisma.tourPackage.findUnique({
      where: { id: req.params.id },
    });

    if (!pkg) {
      return res.status(404).json({ error: "Tour package not found" });
    }

    return res.json(pkg);
  } catch (error) {
    console.error("Fetch Single Package Error:", error);
    return res.status(500).json({ error: "Failed to fetch tour package" });
  }
});

// UPDATE a tour package
router.put("/:id", async (req, res) => {
  try {
    const { title, description, price, duration, places, coverPhoto, status, guideId } = req.body;

    const formattedPlaces = Array.isArray(places)
      ? places.map((p) => ({
          place: String(p.place || "").trim(),
          day: parseInt(p.day, 10) || 1,
        }))
      : undefined;

    const updatedPackage = await prisma.tourPackage.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price != null && { price: parseFloat(price) }),
        ...(duration != null && { duration: parseInt(duration, 10) }),
        ...(formattedPlaces && { places: formattedPlaces }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(status && { status }),
        ...(guideId && { guideId }),
      },
    });

    return res.json(updatedPackage);
  } catch (error) {
    console.error("Update Package Error:", error);
    return res.status(500).json({ error: "Failed to update tour package" });
  }
});

// DELETE a tour package
router.delete("/:id", async (req, res) => {
  try {
    await prisma.tourPackage.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: "Tour package deleted successfully" });
  } catch (error) {
    console.error("Delete Package Error:", error);
    return res.status(500).json({ error: "Failed to delete tour package" });
  }
});

module.exports = router;