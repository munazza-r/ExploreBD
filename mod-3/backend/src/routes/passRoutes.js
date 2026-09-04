const express = require("express");
const { PassTokenError, createPassToken, verifyPassToken } = require("../services/passToken");

function sameBooking(payload, booking) {
  return (
    payload.sub === booking.id &&
    payload.ref === booking.reference &&
    payload.jti === booking.pass.id &&
    payload.gid === booking.guide.id &&
    payload.tid === booking.tourist.id
  );
}

function createPassRouter({ store, secret, demoBookingId }) {
  const router = express.Router();

  router.get("/demo", (req, res) => {
    const booking = store.getById(demoBookingId);
    res.json({ booking });
  });

  router.post("/demo/reset", (req, res) => {
    const booking = store.reset();
    res.json({ message: "Demo booking pass reset.", booking });
  });

  router.post("/verify", (req, res) => {
    const token = String(req.body.token || "").trim();
    const guideId = String(req.body.guideId || "").trim();

    if (!token || !guideId) {
      return res.status(400).json({
        valid: false,
        code: "MISSING_INPUT",
        message: "A QR pass and authenticated guide are required.",
      });
    }

    try {
      const payload = verifyPassToken(token, secret);
      const booking = store.getById(payload.sub);

      if (!booking || !sameBooking(payload, booking)) {
        return res.status(404).json({
          valid: false,
          code: "BOOKING_MISMATCH",
          message: "This pass does not match an active ExploreBD booking.",
        });
      }

      if (booking.payment.status !== "PAID") {
        return res.status(409).json({
          valid: false,
          code: "PAYMENT_NOT_CONFIRMED",
          message: "Payment is not confirmed for this booking.",
        });
      }

      if (booking.guide.id !== guideId) {
        return res.status(403).json({
          valid: false,
          code: "WRONG_GUIDE",
          message: "This booking is assigned to a different guide.",
        });
      }

      if (booking.pass.status === "REVOKED") {
        return res.status(410).json({
          valid: false,
          code: "PASS_REVOKED",
          message: "This booking pass has been revoked.",
        });
      }

      if (booking.pass.status === "CHECKED_IN") {
        return res.json({
          valid: true,
          alreadyVerified: true,
          code: "ALREADY_VERIFIED",
          message: "This booking was already verified.",
          booking,
        });
      }

      const verifiedBooking = store.verifyBooking(booking.id, guideId);
      return res.json({
        valid: true,
        alreadyVerified: false,
        code: "VERIFIED",
        message: "Booking verified. The travelers are ready to check in.",
        booking: verifiedBooking,
      });
    } catch (error) {
      if (error instanceof PassTokenError) {
        return res.status(error.code === "EXPIRED" ? 410 : 400).json({
          valid: false,
          code: error.code,
          message: error.message,
        });
      }

      console.error("QR verification failed:", error);
      return res.status(500).json({
        valid: false,
        code: "SERVER_ERROR",
        message: "The pass could not be verified right now.",
      });
    }
  });

  router.get("/:bookingId", (req, res) => {
    const booking = store.getById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Booking not found." });
    }

    if (booking.payment.status !== "PAID") {
      return res.status(409).json({
        code: "PAYMENT_REQUIRED",
        message: "The QR pass is issued only after successful payment.",
      });
    }

    return res.json({
      booking,
      token: createPassToken(booking, secret),
    });
  });

  return router;
}

module.exports = createPassRouter;

