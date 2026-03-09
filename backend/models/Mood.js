const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Mood rating (1-10)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  // Primary emotion
  emotion: {
    type: String,
    enum: [
      'happy', 'excited', 'calm', 'peaceful',
      'sad', 'anxious', 'stressed', 'angry',
      'lonely', 'hopeful', 'grateful', 'overwhelmed',
      'tired', 'energetic', 'neutral'
    ],
    required: true
  },
  // Secondary emotions (up to 3)
  secondaryEmotions: [{
    type: String,
    enum: [
      'happy', 'excited', 'calm', 'peaceful',
      'sad', 'anxious', 'stressed', 'angry',
      'lonely', 'hopeful', 'grateful', 'overwhelmed',
      'tired', 'energetic', 'neutral'
    ]
  }],
  // Factors affecting mood
  factors: [{
    type: String,
    enum: [
      'sleep', 'exercise', 'medication', 'therapy',
      'social', 'work', 'family', 'relationships',
      'health', 'weather', 'hormones', 'caffeine',
      'alcohol', 'food', 'screen-time', 'meditation'
    ]
  }],
  // Intensity of emotions (1-10)
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Journal entry for this mood
  notes: {
    type: String,
    maxlength: 2000
  },
  // Location (if user allows)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Device info (anonymized)
  deviceInfo: {
    platform: String,
    timezone: String,
    isMobile: Boolean
  },
  // For anonymous entries
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for analytics
moodSchema.index({ userId: 1, timestamp: -1 });
moodSchema.index({ emotion: 1, timestamp: -1 });
moodSchema.index({ rating: 1 });

// Virtual for formatted date
moodSchema.virtual('date').get(function() {
  return this.timestamp.toISOString().split('T')[0];
});

const Mood = mongoose.model('Mood', moodSchema);
module.exports = Mood;