const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true }, // Can be username or groupId
  text: { type: String, default: '' },
  isGroup: { type: Boolean, default: false },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  mediaBase64: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
