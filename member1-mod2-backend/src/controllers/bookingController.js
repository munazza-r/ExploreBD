const prisma = require("../db");

// POST /api/bookings - tourist sends a booking request
async function createBooking(req, res) {
  try {
    const { touristName, guideName, packageName, date, time } = req.body;

    if (!touristName || !guideName || !packageName || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const booking = await prisma.booking.create({
      data: {
        touristName,
        guideName,
        packageName,
        date: new Date(date),
        time,
        status: "PENDING",
      },
    });

    res.status(201).json({ response: "Booking request sent", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while creating the booking" });
  }
}

// GET /api/bookings - list all bookings
async function getBookings(req, res) {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching bookings" });
  }
}

// PATCH /api/bookings/:id/status - guide accepts/rejects, or tourist cancels
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ response: "Booking status updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while updating the booking" });
  }
}

// PATCH /api/bookings/:id - tourist edits their own pending booking (date, time, package, guide)
async function editBooking(req, res) {
  try {
    const { id } = req.params;
    const { guideName, packageName, date, time } = req.body;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Booking not found" });
    if (existing.status !== "PENDING") {
      return res.status(400).json({ error: "Only pending requests can be edited" });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        guideName: guideName || existing.guideName,
        packageName: packageName || existing.packageName,
        date: date ? new Date(date) : existing.date,
        time: time || existing.time,
      },
    });

    res.status(200).json({ response: "Booking updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while editing the booking" });
  }
}

module.exports = { createBooking, getBookings, updateBookingStatus, editBooking };