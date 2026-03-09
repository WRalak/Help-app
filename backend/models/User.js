const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  profile: {
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'] },
    timezone: { type: String, default: 'UTC' }
  },
  // Anonymous mode
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousId: {
    type: String,
    sparse: true
  },
  // Mental health preferences
  preferences: {
    dailyReminder: { type: Boolean, default: true },
    reminderTime: { type: String, default: '09:00' },
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    notificationChannels: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  // Emergency contacts
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: String,
    phone: String,
    email: String,
    isNotified: { type: Boolean, default: false }
  }],
  // Privacy settings
  privacySettings: {
    shareAnonymousData: { type: Boolean, default: false },
    allowAIAnalysis: { type: Boolean, default: true },
    dataRetentionDays: { type: Number, default: 365 },
    encryptedEntries: { type: Boolean, default: true }
  },
  // Authentication
  googleId: String,
  appleId: String,
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.verificationToken;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.ENCRYPTION_SALT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate anonymous ID
userSchema.methods.generateAnonymousId = function() {
  return `anon_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ anonymousId: 1 });
userSchema.index({ 'emergencyContacts.phone': 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;