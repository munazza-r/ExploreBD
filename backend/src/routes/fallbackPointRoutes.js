const express = require("express");
const router = express.Router();
const { requireAuth, requireGuide } = require("../middleware/auth");
const {
  addFallbackPoint, getMyFallbackPoints, deleteFallbackPoint,
} = require("../controllers/meetingController");

router.post("/", requireAuth, requireGuide, addFallbackPoint);
router.get("/mine", requireAuth, requireGuide, getMyFallbackPoints);
router.delete("/:id", requireAuth, requireGuide, deleteFallbackPoint);

module.exports = router;