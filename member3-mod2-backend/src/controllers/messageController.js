const prisma = require("../db");

// Basic phone-number pattern (matches common Bangladeshi and international formats)
const PHONE_REGEX = /(\+?\d[\d\s\-]{7,}\d)/g;

// POST /api/messages - send a message; phone numbers get blocked before payment/booking confirmation
async function sendMessage(req, res) {
  try {
    const { conversationId, senderName, senderRole, content, contactUnlocked } = req.body;

    if (!conversationId || !senderName || !senderRole || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let finalContent = content;
    let wasFiltered = false;

    // Only filter phone numbers if contact info hasn't been unlocked yet (e.g. before payment)
    if (!contactUnlocked && PHONE_REGEX.test(content)) {
      finalContent = content.replace(PHONE_REGEX, "[phone number hidden until booking is confirmed]");
      wasFiltered = true;
    }

    const message = await prisma.message.create({
      data: { conversationId, senderName, senderRole, content: finalContent, wasFiltered },
    });

    res.status(201).json({ response: "Message sent", message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while sending the message" });
  }
}

// GET /api/messages/:conversationId - list all messages in a conversation
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
