const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const { requireAuth, requireGuide, requireAdmin } = require("../middleware/auth");
const {
  submitVerification,
  getAllVerifications,
  updateVerificationStatus,
  getMyVerificationStatus,
} = require("../controllers/verificationController");

// A logged-in guide submits their own documents
router.post(
  "/submit",
  requireAuth,
  requireGuide,
  upload.fields([
    { name: "studentIdCard", maxCount: 1 },
    { name: "nidOrPassport", maxCount: 1 },
  ]),
  submitVerification
);

// A logged-in guide checks their own status
router.get("/me", requireAuth, requireGuide, getMyVerificationStatus);

// Admin-only routes
router.get("/all", requireAuth, requireAdmin, getAllVerifications);
router.patch("/:id/status", requireAuth, requireAdmin, updateVerificationStatus);

module.exports = router;
