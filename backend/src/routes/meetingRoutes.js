const express = require("express");
const router = express.Router();
const { requireAuth, requireGuide } = require("../middleware/auth");
const {
  createMeeting, getMeetings, getTouristMeetings, getGuidePendingApprovals,
  approveMeetingPoints, updateMeetingPoint, confirmMeeting,
} = require("../controllers/meetingController");

router.post("/", createMeeting);
router.get("/", getMeetings);
router.get("/tourist/:touristName", getTouristMeetings);
router.get("/guide/pending", requireAuth, requireGuide, getGuidePendingApprovals);
router.patch("/:id/approve-points", requireAuth, requireGuide, approveMeetingPoints);
router.patch("/:id/meeting-point", updateMeetingPoint);
router.patch("/:id/confirm", confirmMeeting);

module.exports = router;