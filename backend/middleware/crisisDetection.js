const CrisisAlert = require('../models/CrisisAlert');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const twilio = require('../services/twilio');

// Crisis keywords and patterns
const CRISIS_PATTERNS = [
  // Suicide related
  { pattern: /\b(kill myself|end my life|commit suicide|want to die)\b/i, severity: 'CRITICAL' },
  { pattern: /\b(suicide|suicidal|ending it all)\b/i, severity: 'HIGH' },
  { pattern: /\b(hurt myself|self-harm|cut myself)\b/i, severity: 'HIGH' },
  { pattern: /\b(no reason to live|better off dead|give up)\b/i, severity: 'HIGH' },
  
  // Severe distress
  { pattern: /\b(can't go on|can't take it|overwhelmed|hopeless)\b/i, severity: 'MEDIUM' },
  { pattern: /\b(worthless|failure|burden|trapped)\b/i, severity: 'MEDIUM' },
  
  // Anxiety/panic
  { pattern: /\b(panic attack|freaking out|can't breathe|heart racing)\b/i, severity: 'MEDIUM' }
];

exports.detectCrisis = async (userId, text, context = {}) => {
  try {
    let highestSeverity = null;
    let matchedPatterns = [];

    // Check each pattern
    for (const { pattern, severity } of CRISIS_PATTERNS) {
      if (pattern.test(text)) {
        matchedPatterns.push({ pattern: pattern.source, severity });
        if (!highestSeverity || 
            (severity === 'CRITICAL' && highestSeverity !== 'CRITICAL') ||
            (severity === 'HIGH' && highestSeverity === 'MEDIUM')) {
          highestSeverity = severity;
        }
      }
    }

    // If crisis detected
    if (highestSeverity) {
      // Get user for emergency contacts
      const user = await User.findById(userId);
      
      // Create crisis alert
      const alert = await CrisisAlert.create({
        userId,
        severity: highestSeverity,
        triggeredBy: context.type || 'chat',
        content: text.substring(0, 500), // Store snippet
        matchedPatterns,
        metadata: context,
        status: 'ACTIVE'
      });

      // Take action based on severity
      await handleCrisisResponse(user, alert, highestSeverity);

      return {
        detected: true,
        severity: highestSeverity,
        alertId: alert._id,
        message: getCrisisMessage(highestSeverity),
        resources: getCrisisResources()
      };
    }

    return { detected: false };
  } catch (error) {
    console.error('Crisis detection error:', error);
    return { detected: false, error: error.message };
  }
};

const handleCrisisResponse = async (user, alert, severity) => {
  // Critical: Immediate intervention needed
  if (severity === 'CRITICAL') {
    // Send SMS to emergency contacts
    for (const contact of user.emergencyContacts) {
      if (contact.phone) {
        await twilio.sendSMS(
          contact.phone,
          `URGENT: Your contact ${user.name} may be in crisis. Please reach out to them immediately.`
        );
      }
    }

    // Send push notification with crisis resources
    await notificationService.sendNotification(user._id, {
      type: 'CRISIS',
      title: 'Immediate Help Available',
      body: 'You're not alone. Help is available 24/7.',
      priority: 'CRITICAL',
      data: {
        crisisHotlines: [
          { name: '988 Suicide & Crisis Lifeline', number: '988' },
          { name: 'Crisis Text Line', number: '741741' }
        ],
        action: '/crisis'
      }
    });

    // Log for admin monitoring
    alert.notifiedEmergencyContacts = true;
    alert.notifiedAt = new Date();
    await alert.save();
  }

  // High severity: Send resources and offer support
  if (severity === 'HIGH') {
    await notificationService.sendNotification(user._id, {
      type: 'CRISIS',
      title: 'We're here for you',
      body: 'It sounds like you're going through a difficult time. Would you like to talk?',
      priority: 'HIGH',
      data: {
        resources: getCrisisResources(),
        action: '/crisis'
      }
    });
  }
};

const getCrisisMessage = (severity) => {
  const messages = {
    CRITICAL: "I'm very concerned about you. Your safety is the most important thing right now. Please reach out for immediate help:",
    HIGH: "I hear that you're going through a really difficult time. You don't have to face this alone:",
    MEDIUM: "I want to make sure you're okay. Here are some resources that might help:"
  };
  return messages[severity] || messages.MEDIUM;
};

const getCrisisResources = () => {
  return [
    { name: '988 Suicide & Crisis Lifeline', number: '988', description: 'Call or text 988' },
    { name: 'Crisis Text Line', number: '741741', description: 'Text HOME to 741741' },
    { name: 'Veterans Crisis Line', number: '988', description: 'Press 1 after dialing' },
    { name: 'The Trevor Project', number: '866-488-7386', description: 'LGBTQ+ youth' }
  ];
};