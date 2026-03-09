const Notification = require('../models/Notification');
const User = require('../models/User');
const firebaseService = require('../services/firebase');
const cron = require('node-cron');

// Register device token
exports.registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      $set: { fcmToken: token }
    });

    res.json({ message: 'Token registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, {
      readAt: new Date(),
      status: 'READ'
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, readAt: null },
      { readAt: new Date(), status: 'READ' }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send daily reminder
exports.sendDailyReminder = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user.preferences.dailyReminder) return;

    const notification = {
      type: 'REMINDER',
      title: 'Daily Check-in',
      body: 'How are you feeling today? Take a moment to check in.',
      priority: 'NORMAL',
      data: {
        action: '/mood'
      }
    };

    // Save to database
    const savedNotification = await Notification.create({
      userId,
      ...notification
    });

    // Send push notification
    if (user.fcmToken) {
      await firebaseService.sendToDevice(user.fcmToken, notification);
    }

    return savedNotification;
  } catch (error) {
    console.error('Error sending daily reminder:', error);
  }
};

// Schedule daily reminders
cron.schedule('0 9 * * *', async () => { // 9 AM every day
  try {
    const users = await User.find({ 'preferences.dailyReminder': true });
    
    for (const user of users) {
      await exports.sendDailyReminder(user._id);
    }
  } catch (error) {
    console.error('Error in daily reminder cron:', error);
  }
});

// Send crisis alert
exports.sendCrisisAlert = async (userId, severity) => {
  try {
    const user = await User.findById(userId);
    
    const notification = {
      type: 'CRISIS',
      title: severity === 'CRITICAL' ? 'Immediate Help Available' : 'We're Here for You',
      body: severity === 'CRITICAL' 
        ? 'Please reach out for immediate support. Help is available 24/7.'
        : 'It sounds like you're going through a difficult time. Would you like to talk?',
      priority: severity,
      data: {
        resources: true,
        action: '/crisis'
      }
    };

    // Save to database
    await Notification.create({
      userId,
      ...notification
    });

    // Send push notification
    if (user.fcmToken) {
      await firebaseService.sendToDevice(user.fcmToken, notification);
    }

    // Send SMS to emergency contacts for critical alerts
    if (severity === 'CRITICAL' && user.emergencyContacts.length > 0) {
      // Implement SMS sending via Twilio
    }
  } catch (error) {
    console.error('Error sending crisis alert:', error);
  }
};