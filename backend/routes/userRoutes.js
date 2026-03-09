const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, profile } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (profile) user.profile = { ...user.profile, ...profile };

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user stats
router.get('/stats', protect, async (req, res) => {
  try {
    // This would typically aggregate data from multiple collections
    const stats = {
      journalStreak: 5,
      totalMoods: 23,
      averageMood: 7.2,
      mindfulnessMinutes: 45
    };
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;