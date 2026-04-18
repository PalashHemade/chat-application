const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' }, // Base64 or URL
  bio: { type: String, default: 'Hey there! I am using DirectChat.' },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  themePreference: { type: String, default: 'light' },
  isOnline: { type: Boolean, default: false },
  socketId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
