const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: String,
  content: {
    type: String,
    required: true
  },
  moodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mood'
  },
  tags: [String],
  isFavorite: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Journal', journalSchema);