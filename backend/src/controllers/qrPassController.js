const crypto = require("crypto");
const prisma = require("../prisma");
const { PassTokenError, createPassToken, verifyPassToken } = require("../services/passToken");

function secret() {
  return process.env.QR_PASS_SECRET || process.env.JWT_SECRET || "explorebd_local_qr_secret_change_me";
}

// POST /api/qr-passes/issue - tourist requests their pass for an accepted, paid booking
async function issuePass(req, res) {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: "bookingId is required" });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.touristName !== req.user.name) {
      return res.status(403).json({ error: "This isn't your booking." });
    }
    if (!booking.status.startsWith("booked-")) {
      return res.status(409).json({ error: "This booking hasn't been accepted by a guide yet." });
    }

    const payment = await prisma.payment.findFirst({ where: { bookingId } });
    if (!payment || !["ESCROW_HELD", "RELEASED"].includes(payment.status)) {
      return res.status(409).json({ error: "A QR pass is only issued after payment is confirmed." });
    }

    const guideName = booking.status.replace("booked-", "");
    const now = new Date();
    const expiresAt = new Date(new Date(booking.date).getTime() + 24 * 60 * 60 * 1000); // valid until 1 day after the tour date
    const passCode = `PASS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const pass = await prisma.qrPass.upsert({
      where: { bookingId },
      update: { passCode, status: "ACTIVE", issuedAt: now, expiresAt, verifiedAt: null, verifiedBy: null },
      create: { bookingId, passCode, issuedAt: now, expiresAt },
    });

    const token = createPassToken(
      { passId: pass.id, bookingId, touristName: booking.touristName, guideId: payment.guideId, issuedAt: pass.issuedAt, expiresAt: pass.expiresAt },
      secret()
    );

    res.status(200).json({ pass, token, guideName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while issuing the QR pass" });
  }
}

// GET /api/qr-passes/mine/:bookingId - tourist re-fetches their existing pass
async function getMyPass(req, res) {
  try {
    const { bookingId } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.touristName !== req.user.name) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const pass = await prisma.qrPass.findUnique({ where: { bookingId } });
    if (!pass) return res.status(404).json({ error: "No pass issued yet for this booking" });

    const payment = await prisma.payment.findFirst({ where: { bookingId } });
    const token = createPassToken(
      { passId: pass.id, bookingId, touristName: booking.touristName, guideId: payment?.guideId, issuedAt: pass.issuedAt, expiresAt: pass.expiresAt },
      secret()
    );

    res.status(200).json({ pass, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching the pass" });
  }
}

// POST /api/qr-passes/verify - guide scans the tourist's QR pass
async function verifyPass(req, res) {
  const token = String(req.body.token || "").trim();
  if (!token) return res.status(400).json({ valid: false, code: "MISSING_INPUT", message: "A QR pass is required." });

  try {
    const payload = verifyPassToken(token, secret());

    const pass = await prisma.qrPass.findUnique({ where: { id: payload.jti } });
    if (!pass || pass.bookingId !== payload.sub) {
      return res.status(404).json({ valid: false, code: "BOOKING_MISMATCH", message: "This pass does not match an active ExploreBD booking." });
    }

    const booking = await prisma.booking.findUnique({ where: { id: pass.bookingId } });
    if (!booking) return res.status(404).json({ valid: false, code: "BOOKING_MISMATCH", message: "The underlying booking no longer exists." });

    const assignedGuideName = booking.status.replace("booked-", "");
    if (assignedGuideName !== req.user.name) {
      return res.status(403).json({ valid: false, code: "WRONG_GUIDE", message: "This booking is assigned to a different guide." });
    }

    if (pass.status === "REVOKED") {
      return res.status(410).json({ valid: false, code: "PASS_REVOKED", message: "This booking pass has been revoked." });
    }
    if (pass.status === "CHECKED_IN") {
      return res.json({ valid: true, alreadyVerified: true, code: "ALREADY_VERIFIED", message: "This booking was already verified.", pass });
    }

    const updatedPass = await prisma.qrPass.update({
      where: { id: pass.id },
      data: { status: "CHECKED_IN", verifiedAt: new Date(), verifiedBy: req.user.id },
    });

    res.json({ valid: true, alreadyVerified: false, code: "VERIFIED", message: "Booking verified. The travelers are ready to check in.", pass: updatedPass });
  } catch (err) {
    if (err instanceof PassTokenError) {
      return res.status(err.code === "EXPIRED" ? 410 : 400).json({ valid: false, code: err.code, message: err.message });
    }
    console.error(err);
    res.status(500).json({ valid: false, code: "SERVER_ERROR", message: "The pass could not be verified right now." });
  }
}

module.exports = { issuePass, getMyPass, verifyPass };