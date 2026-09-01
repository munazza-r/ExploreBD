const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Create a payment session — returns SSLCommerz's GatewayPageURL to redirect to
router.post("/initiate", paymentController.initiatePayment);

// SSLCommerz redirects (POST, form-encoded) here after checkout
router.post("/sslcz/success", paymentController.handleSuccess);
router.post("/sslcz/fail", paymentController.handleFail);
router.post("/sslcz/cancel", paymentController.handleCancel);
router.post("/sslcz/ipn", paymentController.handleIpn);

router.get("/all", paymentController.getAllPayments);
router.get("/:id", paymentController.getPayment);
router.patch("/:id/release", paymentController.releasePayment);
router.patch("/:id/refund", paymentController.refundPayment);
router.patch("/:id/complete", paymentController.markTourCompleted);

module.exports = router;