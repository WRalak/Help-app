const User = require('../models/User');
const Mood = require('../models/Mood');
const Journal = require('../models/Journal');

// @desc    Get current user profile
// @route   GET /api/users/me
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profile, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
exports.getUserStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get mood stats
    const moods = await Mood.find({
      userId: req.user._id,
      timestamp: { $gte: thirtyDaysAgo }
    });

    // Get journal streak (consecutive days with entries)
    const journals = await Journal.find({
      userId: req.user._id
    }).sort({ timestamp: -1 });

    let streak = 0;
    if (journals.length > 0) {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < journals.length; i++) {
        const entryDate = new Date(journals[i].timestamp);
        entryDate.setHours(0, 0, 0, 0);
        
        if (entryDate.getTime() === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const stats = {
      journalStreak: streak,
      totalMoods: moods.length,
      averageMood: moods.reduce((acc, m) => acc + m.rating, 0) / (moods.length || 1),
      mindfulnessMinutes: 45 // This would come from a meditation tracking model
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update preferences
// @route   PATCH /api/users/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add emergency contact
// @route   POST /api/users/emergency-contact
exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, phone, email } = req.body;
    const user = await User.findById(req.user._id);

    user.emergencyContacts.push({ name, relationship, phone, email });
    await user.save();

    res.json({ 
      success: true, 
      emergencyContacts: user.emergencyContacts 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/users/emergency-contact/:id
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== req.params.id
    );
    await user.save();

    res.json({ 
      success: true, 
      emergencyContacts: user.emergencyContacts 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle anonymous mode
// @route   POST /api/users/anonymous-mode
exports.toggleAnonymousMode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isAnonymous = !user.isAnonymous;
    
    if (user.isAnonymous && !user.anonymousId) {
      user.anonymousId = `anon_${Math.random().toString(36).substring(2, 15)}`;
    }

    await user.save();

    res.json({ 
      success: true, 
      isAnonymous: user.isAnonymous,
      anonymousId: user.anonymousId 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/users/account
exports.deleteAccount = async (req, res) => {
  try {
    // Delete all user data
    await Mood.deleteMany({ userId: req.user._id });
    await Journal.deleteMany({ userId: req.user._id });
    await Chat.deleteMany({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};