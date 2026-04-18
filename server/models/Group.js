const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admin: { type: String, required: true }, // Name of the admin user
  members: [{ type: String }], // Array of usernames
  groupIcon: { type: String, default: '' } // Base64
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
