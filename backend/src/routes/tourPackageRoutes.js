const express = require("express");
const router = express.Router();
const { requireAuth, requireGuide } = require("../middleware/auth");
const {
  createPackage, getPackages, getMyPackages, getPackageById, updatePackage, deletePackage,
} = require("../controllers/tourPackageController");

// Public browsing
router.get("/", getPackages);

// Must come before "/:id" - otherwise "mine" would be treated as an :id value
router.get("/mine", requireAuth, requireGuide, getMyPackages);

router.get("/:id", getPackageById);

// Guide-only management
router.post("/", requireAuth, requireGuide, createPackage);
router.put("/:id", requireAuth, requireGuide, updatePackage);
router.delete("/:id", requireAuth, requireGuide, deletePackage);

module.exports = router;