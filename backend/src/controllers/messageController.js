const prisma = require("../prisma");

// Basic phone-number pattern (matches common Bangladeshi and international formats)
const PHONE_REGEX = /(\+?\d[\d\s\-]{7,}\d)/g;

// POST /api/messages - sender identity now comes from the logged-in user, not the request body
async function sendMessage(req, res) {
  try {
    const { conversationId, content, contactUnlocked } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: "conversationId and content are required" });
    }

    let finalContent = content;
    let wasFiltered = false;

    if (!contactUnlocked && PHONE_REGEX.test(content)) {
      finalContent = content.replace(PHONE_REGEX, "[phone number hidden until booking is confirmed]");
      wasFiltered = true;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderName: req.user.name,
        senderRole: req.user.role,
        content: finalContent,
        wasFiltered,
      },
    });

    res.status(201).json({ response: "Message sent", message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while sending the message" });
  }
}

// GET /api/messages/:conversationId - any logged-in user can view (participant-only
// restriction can be added later once conversationId is tied to real bookings)
async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching messages" });
  }
}

module.exports = { sendMessage, getMessages };