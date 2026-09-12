const mongoose = require('mongoose');

const TrafficLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  sourceIP: { type: String, required: true, index: true },
  destinationIP: { type: String, required: true },
  protocol: { type: String, required: true },
  packetSize: { type: Number, required: true },
  requestRate: { type: Number, required: true },
  payloadEntropy: { type: Number, required: true },
  interArrivalTime: { type: Number, required: true },
  isAnomaly: { type: Boolean, default: false }
});

module.exports = mongoose.model('TrafficLog', TrafficLogSchema);