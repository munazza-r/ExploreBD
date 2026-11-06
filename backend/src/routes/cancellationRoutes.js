const express = require("express");
const router = express.Router();
const { requireAuth, requireTourist, requireGuide, requireAdmin } = require("../middleware/auth");
const {
    handleTouristCancellation, handleGuideCancellation, handleCompensationClaim,
    handleSosRequest, handleAdminResolve, handleGetRequests, handleGetMyRequests, handleGetAllSos,
  } = require("../controllers/cancellationController");

router.post("/cancel/tourist", requireAuth, requireTourist, handleTouristCancellation);
router.post("/cancel/guide", requireAuth, requireGuide, handleGuideCancellation);
router.post("/compensation/request", requireAuth, handleCompensationClaim);
router.post("/sos/request", requireAuth, handleSosRequest);
router.patch("/compensation/admin-resolve", requireAuth, requireAdmin, handleAdminResolve);
router.get("/requests", requireAuth, requireAdmin, handleGetRequests);
router.get("/mine", requireAuth, handleGetMyRequests);
router.get("/sos/all", requireAuth, requireAdmin, handleGetAllSos);

module.exports = router;