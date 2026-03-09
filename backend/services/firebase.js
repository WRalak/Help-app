const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

class FirebaseNotificationService {
  constructor() {
    this.messaging = admin.messaging();
  }

  // Send push notification to specific device
  async sendToDevice(deviceToken, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        token: deviceToken,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'mental_health_channel'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Send to multiple devices
  async sendToMultipleDevices(deviceTokens, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data,
        tokens: deviceTokens,
        android: {
          priority: 'high'
        }
      };

      const response = await this.messaging.sendEachForMulticast(message);
      
      console.log(`${response.successCount} messages sent successfully`);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(deviceTokens[idx]);
          }
        });
        console.log('Failed tokens:', failedTokens);
        
        // Remove invalid tokens from database
        await this.removeInvalidTokens(failedTokens);
      }
      
      return response;
    } catch (error) {
      console.error('Error sending multicast:', error);
      throw error;
    }
  }

  // Send to topic
  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data,
        topic,
        android: {
          priority: 'high'
        }
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent to topic:', response);
      return response;
    } catch (error) {
      console.error('Error sending to topic:', error);
      throw error;
    }
  }

  // Subscribe device to topic
  async subscribeToTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.subscribeToTopic(deviceTokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return response;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.unsubscribeFromTopic(deviceTokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
      return response;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }

  // Schedule notification (using a job queue like Bull)
  async scheduleNotification(userId, notification, scheduleTime) {
    // Implement with Bull or similar job queue
    // This is a placeholder
    console.log('Scheduling notification for:', scheduleTime);
  }

  // Remove invalid tokens from database
  async removeInvalidTokens(failedTokens) {
    try {
      // Implement database cleanup
      // await User.updateMany(
      //   { fcmToken: { $in: failedTokens } },
      //   { $set: { fcmToken: null } }
      // );
    } catch (error) {
      console.error('Error removing invalid tokens:', error);
    }
  }
}

module.exports = new FirebaseNotificationService();