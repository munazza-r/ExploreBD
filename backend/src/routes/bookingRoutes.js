const express = require("express");
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus, editBooking } = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/", getBookings);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:id", editBooking);

module.exports = router;