const express = require("express");
const router = express.Router();
const {
  createMeeting, getMeetings, getRouteInfo, updateMeetingPoint, confirmMeeting,
} = require("../controllers/meetingController");

router.post("/", createMeeting);
router.get("/", getMeetings);
router.post("/route-info", getRouteInfo);
router.patch("/:id/meeting-point", updateMeetingPoint);
router.patch("/:id/confirm", confirmMeeting);

module.exports = router;
