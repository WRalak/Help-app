const Mood = require('../models/Mood');

// @desc    Create mood entry
// @route   POST /api/mood
exports.createMood = async (req, res) => {
  try {
    const mood = new Mood({
      userId: req.user._id,
      rating: req.body.rating,
      emotion: req.body.emotion,
      secondaryEmotions: req.body.secondaryEmotions || [],
      factors: req.body.factors || [],
      notes: req.body.notes,
      intensity: req.body.intensity || 5,
      timestamp: new Date()
    });

    await mood.save();
    res.status(201).json({ success: true, mood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's moods
// @route   GET /api/mood
exports.getMoods = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const moods = await Mood.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, moods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent moods for dashboard
// @route   GET /api/mood/recent
exports.getRecentMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(7);

    res.json({ success: true, moods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if mood logged today
// @route   GET /api/mood/today
exports.checkTodayMood = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mood = await Mood.findOne({
      userId: req.user._id,
      timestamp: { $gte: today }
    });

    res.json({ 
      success: true, 
      hasMood: !!mood, 
      mood 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get mood statistics
// @route   GET /api/mood/stats
exports.getMoodStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moods = await Mood.find({
      userId: req.user._id,
      timestamp: { $gte: thirtyDaysAgo }
    });

    const stats = {
      total: moods.length,
      average: moods.reduce((acc, m) => acc + m.rating, 0) / moods.length || 0,
      byEmotion: {},
      byFactor: {},
      trend: []
    };

    // Calculate emotion distribution
    moods.forEach(mood => {
      stats.byEmotion[mood.emotion] = (stats.byEmotion[mood.emotion] || 0) + 1;
      mood.factors.forEach(factor => {
        stats.byFactor[factor] = (stats.byFactor[factor] || 0) + 1;
      });
    });

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};