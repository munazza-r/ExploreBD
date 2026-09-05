const express = require("express");
const router = express.Router();
const { requireAuth, requireTourist, requireGuide, requireAdmin } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

router.post("/initiate", requireAuth, requireTourist, paymentController.initiatePayment);

// SSLCommerz redirects - no auth (these come FROM SSLCommerz's servers, not a logged-in user)
router.post("/sslcz/success", paymentController.handleSuccess);
router.post("/sslcz/fail", paymentController.handleFail);
router.post("/sslcz/cancel", paymentController.handleCancel);
router.post("/sslcz/ipn", paymentController.handleIpn);

router.get("/guide/earnings", requireAuth, requireGuide, paymentController.getGuideEarnings);
router.get("/all", requireAuth, requireAdmin, paymentController.getAllPayments);
router.get("/:id", requireAuth, paymentController.getPayment);
router.patch("/:id/complete", requireAuth, requireTourist, paymentController.markTourCompleted);
router.patch("/:id/release", requireAuth, requireAdmin, paymentController.releasePayment);
router.patch("/:id/refund", requireAuth, requireAdmin, paymentController.refundPayment);

module.exports = router;