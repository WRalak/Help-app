const Journal = require('../models/Journal');

// @desc    Create journal entry
// @route   POST /api/journal
exports.createEntry = async (req, res) => {
  try {
    const entry = new Journal({
      userId: req.user._id,
      title: req.body.title,
      content: req.body.content,
      moodId: req.body.moodId,
      tags: req.body.tags || [],
      isFavorite: req.body.isFavorite || false,
      timestamp: new Date()
    });

    await entry.save();
    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all journal entries
// @route   GET /api/journal
exports.getEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const entries = await Journal.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('moodId');

    const total = await Journal.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      entries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent entries
// @route   GET /api/journal/recent
exports.getRecentEntries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const entries = await Journal.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('moodId');

    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single journal entry
// @route   GET /api/journal/:id
exports.getEntry = async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('moodId');

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
exports.updateEntry = async (req, res) => {
  try {
    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle favorite
// @route   PATCH /api/journal/:id/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({ success: true, isFavorite: entry.isFavorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search journal entries
// @route   GET /api/journal/search
exports.searchEntries = async (req, res) => {
  try {
    const { query, tag, startDate, endDate } = req.query;
    const searchQuery = { userId: req.user._id };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (tag) {
      searchQuery.tags = tag;
    }

    if (startDate || endDate) {
      searchQuery.timestamp = {};
      if (startDate) searchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) searchQuery.timestamp.$lte = new Date(endDate);
    }

    const entries = await Journal.find(searchQuery)
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};