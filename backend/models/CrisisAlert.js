const mongoose = require('mongoose');

const crisisAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  severity: {
    type: String,
    enum: ['MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  triggeredBy: String,
  content: String,
  matchedPatterns: [{
    pattern: String,
    severity: String
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED', 'ESCALATED'],
    default: 'ACTIVE'
  },
  notifiedEmergencyContacts: {
    type: Boolean,
    default: false
  },
  notifiedAt: Date,
  resolvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('CrisisAlert', crisisAlertSchema);