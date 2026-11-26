const mongoose = require('mongoose');

// ER Diagram (Section 4.8): Message Schema
const MessageSchema = new mongoose.Schema({
  match_id: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, default: '' },
  receiverId: { type: String, required: true },
  content: { type: String, required: true }, // ER Diagram field 'content'
  message: { type: String, required: true }, // Socket.IO Appendix D.3 field 'message'
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
