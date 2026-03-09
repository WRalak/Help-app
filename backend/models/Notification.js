const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['REMINDER', 'CRISIS', 'ACHIEVEMENT', 'MESSAGE', 'SYSTEM'],
    required: true
  },
  title: String,
  body: String,
  data: mongoose.Schema.Types.Mixed,
  readAt: Date,
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'READ'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);