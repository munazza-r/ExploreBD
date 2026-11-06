const express = require("express");
const router = express.Router();
const {
  addGuide, getGuides, searchGuides, getGuideDetails, updateAvailability,
  getMyProfile, updateMyProfile,
} = require("../controllers/guideController");
const { requireAuth, requireGuide } = require("../middleware/auth");

// Public search/browse - no login required (tourists searching guides)
router.get("/", getGuides);
router.post("/search", searchGuides);

// Guide profile management - requires a logged-in guide.
// IMPORTANT: these must be declared BEFORE "/:id" below, otherwise Express
// would match "/me" as if "me" were an :id value and call the wrong handler.
router.get("/me", requireAuth, requireGuide, getMyProfile);
router.put("/me", requireAuth, requireGuide, updateMyProfile);

router.get("/:id", getGuideDetails);

// Testing/admin
router.post("/", addGuide);
router.patch("/:id/availability", updateAvailability);

module.exports = router;
