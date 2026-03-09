const Meditation = require('../models/Meditation');

// @desc    Get meditation exercises
// @route   GET /api/meditation/exercises
exports.getExercises = async (req, res) => {
  try {
    const exercises = [
      {
        id: 'breathing-1',
        title: '4-7-8 Breathing',
        description: 'Calm your nervous system with this breathing technique',
        duration: 300, // 5 minutes
        icon: '🌬️',
        category: 'breathing',
        level: 'beginner',
        audioUrl: '/audio/breathing-1.mp3',
        instructions: [
          'Find a comfortable seated position',
          'Exhale completely through your mouth',
          'Close your mouth and inhale quietly through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale completely through your mouth for 8 counts',
          'Repeat 4-8 times'
        ]
      },
      {
        id: 'body-scan-1',
        title: 'Body Scan Meditation',
        description: 'Release tension throughout your body',
        duration: 600, // 10 minutes
        icon: '🧘',
        category: 'body-scan',
        level: 'beginner',
        audioUrl: '/audio/body-scan-1.mp3',
        instructions: [
          'Lie down or sit comfortably',
          'Close your eyes and take a few deep breaths',
          'Bring awareness to your feet, noticing any sensations',
          'Slowly move your attention up through your body',
          'Notice areas of tension without judgment',
          'Imagine breathing into tense areas and releasing'
        ]
      },
      {
        id: 'loving-kindness-1',
        title: 'Loving-Kindness Meditation',
        description: 'Cultivate compassion for yourself and others',
        duration: 450, // 7.5 minutes
        icon: '💖',
        category: 'loving-kindness',
        level: 'intermediate',
        audioUrl: '/audio/loving-kindness-1.mp3',
        instructions: [
          'Sit comfortably and close your eyes',
          'Bring to mind someone you care about',
          'Silently repeat: "May you be happy, may you be healthy, may you be safe"',
          'Extend these wishes to yourself',
          'Finally, extend to all beings everywhere'
        ]
      },
      {
        id: 'mindful-walking-1',
        title: 'Mindful Walking',
        description: 'Connect with your body and surroundings',
        duration: 480, // 8 minutes
        icon: '🚶',
        category: 'walking',
        level: 'beginner',
        audioUrl: '/audio/walking-1.mp3',
        instructions: [
          'Find a quiet place to walk slowly',
          'Notice the sensation of your feet touching the ground',
          'Feel the movement in your legs and body',
          'Notice your breath as you walk',
          'Observe your surroundings without judgment'
        ]
      },
      {
        id: 'sleep-1',
        title: 'Sleep Meditation',
        description: 'Gentle guidance for restful sleep',
        duration: 900, // 15 minutes
        icon: '😴',
        category: 'sleep',
        level: 'beginner',
        audioUrl: '/audio/sleep-1.mp3',
        instructions: [
          'Lie down in bed comfortably',
          'Take a few deep, relaxing breaths',
          'Slowly scan your body from head to toe',
          'Imagine each part of your body becoming heavy and relaxed',
          'Let go of any thoughts about the day',
          'Drift peacefully toward sleep'
        ]
      },
      {
        id: 'anxiety-1',
        title: 'Anxiety Relief',
        description: 'Calm anxious thoughts and feelings',
        duration: 600, // 10 minutes
        icon: '🕊️',
        category: 'anxiety',
        level: 'intermediate',
        audioUrl: '/audio/anxiety-1.mp3',
        instructions: [
          'Sit comfortably and acknowledge your anxiety without judgment',
          'Take slow, deep breaths',
          'Notice where anxiety lives in your body',
          'Imagine breathing calm into those areas',
          'Remind yourself: "This feeling is temporary"',
          'Return your focus to your breath'
        ]
      }
    ];

    // Filter by category if provided
    const { category, level } = req.query;
    let filtered = exercises;

    if (category && category !== 'all') {
      filtered = filtered.filter(e => e.category === category);
    }

    if (level && level !== 'all') {
      filtered = filtered.filter(e => e.level === level);
    }

    res.json({ success: true, exercises: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single exercise
// @route   GET /api/meditation/exercises/:id
exports.getExercise = async (req, res) => {
  try {
    const exercises = [
      // Same exercises as above - you'd normally fetch from database
    ];

    const exercise = exercises.find(e => e.id === req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    res.json({ success: true, exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track completed meditation
// @route   POST /api/meditation/track
exports.trackMeditation = async (req, res) => {
  try {
    const { exerciseId, title, duration, moodBefore, moodAfter, notes } = req.body;

    const meditation = new Meditation({
      userId: req.user._id,
      exerciseId,
      title,
      duration,
      moodBefore,
      moodAfter,
      notes,
      completedAt: new Date()
    });

    await meditation.save();

    // Update user stats
    const totalMinutes = await Meditation.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    res.json({ 
      success: true, 
      meditation,
      totalMinutes: totalMinutes[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get meditation history
// @route   GET /api/meditation/history
exports.getHistory = async (req, res) => {
  try {
    const history = await Meditation.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50);

    // Get stats
    const stats = await Meditation.aggregate([
      { $match: { userId: req.user._id } },
      { 
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMinutes: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.json({ 
      success: true, 
      history,
      stats: stats[0] || { totalSessions: 0, totalMinutes: 0, avgDuration: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get meditation stats
// @route   GET /api/meditation/stats
exports.getStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Meditation.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          completedAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get category breakdown
    const categoryStats = await Meditation.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$title',
          count: { $sum: 1 },
          totalMinutes: { $sum: '$duration' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ 
      success: true, 
      dailyStats: stats,
      topCategories: categoryStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ambient sounds
// @route   GET /api/meditation/sounds
exports.getSounds = async (req, res) => {
  try {
    const sounds = [
      { id: 'rain', name: 'Rain', icon: '🌧️', url: '/sounds/rain.mp3', duration: 3600 },
      { id: 'forest', name: 'Forest', icon: '🌲', url: '/sounds/forest.mp3', duration: 3600 },
      { id: 'ocean', name: 'Ocean', icon: '🌊', url: '/sounds/ocean.mp3', duration: 3600 },
      { id: 'fire', name: 'Fireplace', icon: '🔥', url: '/sounds/fire.mp3', duration: 3600 },
      { id: 'white-noise', name: 'White Noise', icon: '📻', url: '/sounds/white-noise.mp3', duration: 3600 },
      { id: 'meditation-bells', name: 'Meditation Bells', icon: '🔔', url: '/sounds/bells.mp3', duration: 600 },
      { id: 'singing-bowls', name: 'Singing Bowls', icon: '🥣', url: '/sounds/bowls.mp3', duration: 1800 },
      { id: 'wind', name: 'Wind', icon: '🌪️', url: '/sounds/wind.mp3', duration: 3600 }
    ];

    res.json({ success: true, sounds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get guided meditations by category
// @route   GET /api/meditation/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'all', name: 'All', icon: '🎯', count: 12 },
      { id: 'breathing', name: 'Breathing', icon: '🌬️', count: 4 },
      { id: 'body-scan', name: 'Body Scan', icon: '🧘', count: 3 },
      { id: 'loving-kindness', name: 'Loving-Kindness', icon: '💖', count: 2 },
      { id: 'sleep', name: 'Sleep', icon: '😴', count: 3 },
      { id: 'anxiety', name: 'Anxiety Relief', icon: '🕊️', count: 3 },
      { id: 'focus', name: 'Focus', icon: '🎯', count: 2 },
      { id: 'gratitude', name: 'Gratitude', icon: '🙏', count: 2 }
    ];

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};