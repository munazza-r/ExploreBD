const express = require("express");
const router = express.Router();
const { requireAuth, requireTourist, requireGuide } = require("../middleware/auth");
const { issuePass, getMyPass, verifyPass } = require("../controllers/qrPassController");

router.post("/issue", requireAuth, requireTourist, issuePass);
router.get("/mine/:bookingId", requireAuth, requireTourist, getMyPass);
router.post("/verify", requireAuth, requireGuide, verifyPass);

module.exports = router;