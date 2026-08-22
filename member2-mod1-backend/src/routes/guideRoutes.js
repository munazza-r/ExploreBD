const express = require("express");
const router = express.Router();
const {
  addGuide,
  getGuides,
  searchGuides,
  getGuideDetails,
  updateAvailability,
} = require("../controllers/guideController");

router.post("/", addGuide);                          // POST   /api/guides
router.get("/", getGuides);                           // GET    /api/guides
router.post("/search", searchGuides);                 // POST   /api/guides/search
router.get("/:id", getGuideDetails);                  // GET    /api/guides/:id
router.patch("/:id/availability", updateAvailability);// PATCH  /api/guides/:id/availability

module.exports = router;
