const prisma = require("../prisma");

// A guide is considered "booked" for a slot only once a tourist's request
// has actually been accepted (status starts with "booked-"). PENDING
// requests don't block the slot yet — the guide hasn't said yes.
const isSlotTaken = async (guideName, date, time) => {
  const existing = await prisma.booking.findFirst({
    where: {
      guideName,
      date: new Date(date),
      time,
      status: { startsWith: "booked-" },
    },
  });
  return !!existing;
};

// GET /api/bookings/available-guides?guideNames=Alice,Bob&date=2026-09-10&time=10:00
// Given a list of candidate guides and a slot, returns which ones are free.
async function getAvailableGuides(req, res) {
  try {
    const { guideNames, date, time } = req.query;
    if (!guideNames || !date || !time) {
      return res.status(400).json({ error: "guideNames, date and time are required" });
    }

    const candidates = guideNames.split(",").map((n) => n.trim()).filter(Boolean);

    const results = await Promise.all(
      candidates.map(async (name) => ({
        guideName: name,
        available: !(await isSlotTaken(name, date, time)),
      }))
    );

    res.status(200).json({ slot: { date, time }, guides: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while checking guide availability" });
  }
}

// POST /api/bookings - tourist sends a booking request
async function createBooking(req, res) {
  try {
    const { touristName, guideName, packageName, date, time } = req.body;
    if (!touristName || !guideName || !packageName || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Enforce: "If any guide is available for that slot, they can send a
    // request, else not." — a guide already booked for this exact slot
    // cannot receive another request for the same date/time.
    const taken = await isSlotTaken(guideName, date, time);
    if (taken) {
      return res.status(409).json({
        error: `${guideName} is already booked for ${date} at ${time}. Please choose another guide or slot.`,
      });
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
    const { status } = req.body; // expected: "ACCEPT" | "CANCELLED" | "PENDING"

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Booking not found" });

    let finalStatus;

    if (status === "ACCEPT") {
      // Re-check availability at accept time too — in case this same guide
      // was accepted for an overlapping slot on another request meanwhile.
      const taken = await isSlotTaken(existing.guideName, existing.date, existing.time);
      if (taken) {
        return res.status(409).json({
          error: `${existing.guideName} is already booked for this slot on another confirmed request.`,
        });
      }
      // "the status will be updated as booked-(Guide's Name)"
      finalStatus = `booked-${existing.guideName}`;
    } else if (status === "CANCELLED" || status === "PENDING") {
      finalStatus = status;
    } else {
      return res.status(400).json({ error: "Invalid status value. Use ACCEPT, CANCELLED, or PENDING." });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: finalStatus },
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

    const newGuideName = guideName || existing.guideName;
    const newDate = date ? new Date(date) : existing.date;
    const newTime = time || existing.time;

    // If they changed guide/date/time, re-check the new slot is free
    if (guideName || date || time) {
      const taken = await isSlotTaken(newGuideName, newDate, newTime);
      if (taken) {
        return res.status(409).json({
          error: `${newGuideName} is already booked for that slot. Please choose another guide or time.`,
        });
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        guideName: newGuideName,
        packageName: packageName || existing.packageName,
        date: newDate,
        time: newTime,
      },
    });
    res.status(200).json({ response: "Booking updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while editing the booking" });
  }
}

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
  editBooking,
  getAvailableGuides,
};
