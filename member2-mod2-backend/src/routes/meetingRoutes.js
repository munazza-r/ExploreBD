const express = require("express");
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getTouristMeetings,
  getGuidePendingApprovals,
  approveMeetingPoints,
  updateMeetingPoint,
  confirmMeeting,
} = require("../controllers/meetingController");

router.post("/", createMeeting);
router.get("/", getMeetings);
router.get("/tourist/:touristName", getTouristMeetings);
router.get("/guide/:guideName/pending", getGuidePendingApprovals);
router.patch("/:id/approve-points", approveMeetingPoints);
router.patch("/:id/meeting-point", updateMeetingPoint);
router.patch("/:id/confirm", confirmMeeting);

module.exports = router;
