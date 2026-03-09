const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Mood = require('../models/Mood');

// Get recent moods
router.get('/recent', protect, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(7);
    res.json({ moods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if mood logged today
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mood = await Mood.findOne({
      userId: req.user._id,
      timestamp: { $gte: today }
    });
    
    res.json({ hasMood: !!mood, mood });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new mood entry
router.post('/', protect, async (req, res) => {
  try {
    const mood = new Mood({
      userId: req.user._id,
      ...req.body,
      timestamp: new Date()
    });
    await mood.save();
    res.status(201).json({ mood });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;