const mongoose = require('mongoose');

const meditationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  exerciseId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  notes: String,
  moodBefore: Number,
  moodAfter: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Meditation', meditationSchema);