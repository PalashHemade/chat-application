const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isOnline: { type: Boolean, default: false },
  socketId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
