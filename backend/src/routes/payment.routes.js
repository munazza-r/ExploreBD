const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Create a new payment (bKash real sandbox, or Nagad simulated)
router.post("/initiate", paymentController.initiatePayment);

// bKash redirects the tourist back here after they approve/cancel payment
router.get("/callback", paymentController.handleCallback);
router.post("/callback", paymentController.handleCallback);

// Fetch a single payment's current state
router.get("/:id", paymentController.getPayment);

// Manually re-check status with bKash (useful if callback was missed)
router.get("/:id/sync", paymentController.syncPaymentStatus);

// Admin: release escrowed funds to the guide after tour completion
router.patch("/:id/release", paymentController.releasePayment);

// Admin: refund the tourist (e.g. cancelled booking)
router.patch("/:id/refund", paymentController.refundPayment);

module.exports = router;