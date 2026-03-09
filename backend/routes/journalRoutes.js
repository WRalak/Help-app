const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Journal = require('../models/Journal');

// Get recent journal entries
router.get('/recent', protect, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(parseInt(req.query.limit) || 3);
    res.json({ entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get paginated journal entries
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const entries = await Journal.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Journal.countDocuments({ userId: req.user._id });

    res.json({
      entries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create journal entry
router.post('/', protect, async (req, res) => {
  try {
    const entry = new Journal({
      userId: req.user._id,
      ...req.body,
      timestamp: new Date()
    });
    await entry.save();
    res.status(201).json({ entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle favorite
router.patch('/:id/favorite', protect, async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({ isFavorite: entry.isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete entry
router.delete('/:id', protect, async (req, res) => {
  try {
    await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;