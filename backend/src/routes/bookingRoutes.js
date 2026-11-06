const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  editBooking,
  getAvailableGuides,
} = require("../controllers/bookingController");

// IMPORTANT: this specific route must come BEFORE "/:id" style routes
// so Express doesn't treat "available-guides" as an :id value.
router.get("/available-guides", getAvailableGuides);

router.post("/", createBooking);
router.get("/", getBookings);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:id", editBooking);

module.exports = router;
