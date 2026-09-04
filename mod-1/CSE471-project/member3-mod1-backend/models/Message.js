const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  recipientId: { type: String, required: true, index: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['TOURIST', 'GUIDE'], required: true },
  content: { type: String, required: true, maxlength: 2000 },
  wasFiltered: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
