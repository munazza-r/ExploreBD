const express = require('express');
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const PHONE_REGEX = /(\+?\d[\d\s-]{7,}\d)/g;

router.use(requireAuth);

function conversationIdFor(firstId, secondId) {
  return [String(firstId), String(secondId)].sort().join(':');
}

function initials(name) {
  return String(name || 'User').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
}

async function findCounterpart(req, counterpartId) {
  const expectedRole = req.user.role === 'GUIDE' ? 'TOURIST' : 'GUIDE';
  return User.findOne({ _id: counterpartId, role: expectedRole }).select('name role');
}

router.get('/conversations', async (req, res) => {
  try {
    const expectedRole = req.user.role === 'GUIDE' ? 'TOURIST' : 'GUIDE';
    const counterparts = await User.find({ role: expectedRole }).select('name role').sort({ createdAt: -1 });

    const conversations = await Promise.all(counterparts.map(async counterpart => {
      const conversationId = conversationIdFor(req.user.id, counterpart.id);
      const latest = await Message.findOne({ conversationId }).sort({ createdAt: -1 }).lean();
      return {
        id: counterpart.id,
        conversationId,
        initials: initials(counterpart.name),
        name: counterpart.name,
        role: counterpart.role,
        preview: latest?.content || 'Start a secure conversation',
        time: latest?.createdAt || null
      };
    }));

    conversations.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
    return res.json(conversations);
  } catch (error) {
    console.error('Conversation list error:', error);
    return res.status(500).json({ error: 'Could not load conversations' });
  }
});

router.get('/:counterpartId', async (req, res) => {
  try {
    const counterpart = await findCounterpart(req, req.params.counterpartId);
    if (!counterpart) return res.status(404).json({ error: 'Conversation participant was not found' });

    const conversationId = conversationIdFor(req.user.id, counterpart.id);
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
    return res.json(messages.map(message => ({ ...message, id: String(message._id) })));
  } catch (error) {
    console.error('Message fetch error:', error);
    return res.status(500).json({ error: 'Could not load messages' });
  }
});

router.post('/:counterpartId', async (req, res) => {
  try {
    const counterpart = await findCounterpart(req, req.params.counterpartId);
    if (!counterpart) return res.status(404).json({ error: 'Conversation participant was not found' });

    const content = String(req.body.content || '').trim().slice(0, 2000);
    if (!content) return res.status(400).json({ error: 'A message is required' });

    const touristId = req.user.role === 'TOURIST' ? req.user.id : counterpart.id;
    const guideId = req.user.role === 'GUIDE' ? req.user.id : counterpart.id;
    const contactUnlocked = Boolean(await Booking.exists({
      'tourist.id': touristId,
      'guide.id': guideId,
      'payment.status': 'PAID'
    }));

    const containsPhone = PHONE_REGEX.test(content);
    PHONE_REGEX.lastIndex = 0;
    const finalContent = !contactUnlocked && containsPhone
      ? content.replace(PHONE_REGEX, '[phone number hidden until booking is confirmed]')
      : content;

    const created = await Message.create({
      conversationId: conversationIdFor(req.user.id, counterpart.id),
      senderId: req.user.id,
      recipientId: counterpart.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      content: finalContent,
      wasFiltered: !contactUnlocked && containsPhone
    });

    const message = created.toObject();
    return res.status(201).json({ response: 'Message sent', message: { ...message, id: String(created._id) } });
  } catch (error) {
    console.error('Message send error:', error);
    return res.status(500).json({ error: 'Could not send the message' });
  }
});

module.exports = router;
