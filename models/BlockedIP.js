const mongoose = require('mongoose');

const BlockedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, required: true },
  offenseCount: { type: Number, default: 1 },
  blockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlockedIP', BlockedIPSchema);