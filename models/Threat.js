const mongoose = require('mongoose');

const ThreatSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  sourceIP: { type: String, required: true, index: true },
  protocol: { type: String, required: true },
  classification: { 
    type: String, 
    enum: ['Brute Force', 'SQL Injection', 'XSS', 'DDoS', 'Zero-Day Anomaly', 'Normal'],
    required: true 
  },
  severity: { type: String, enum: ['normal', 'medium', 'high'], required: true },
  confidence: { type: Number, required: true },
  payloadSnippet: { type: String },
  isBlocked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Threat', ThreatSchema);