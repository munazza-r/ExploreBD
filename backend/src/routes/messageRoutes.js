const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { sendMessage, getMessages } = require("../controllers/messageController");

router.post("/", requireAuth, sendMessage);
router.get("/:conversationId", requireAuth, getMessages);

module.exports = router;