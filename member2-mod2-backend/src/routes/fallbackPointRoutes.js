const express = require("express");
const router = express.Router();
const {
  addFallbackPoint,
  getFallbackPoints,
  deleteFallbackPoint,
} = require("../controllers/meetingController");

router.post("/", addFallbackPoint);
router.get("/:guideName", getFallbackPoints);
router.delete("/:id", deleteFallbackPoint);

module.exports = router;
