const express = require('express');
const router = express.Router();
const { protect, optional } = require('../middleware/auth');

// AI chat endpoint
router.post('/chat', optional, async (req, res) => {
  try {
    const { message, context } = req.body;

    // Simple mock response for now
    // In production, this would call OpenAI API
    const responses = [
      "I hear you. How does that make you feel?",
      "That sounds challenging. Would you like to explore some coping strategies?",
      "Thank you for sharing that with me. You're doing great by reaching out.",
      "Remember to be kind to yourself. What's one small thing you can do for yourself today?",
      "I'm here to listen. Would you like to tell me more about that?"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Crisis detection (simple keyword check)
    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'want to die'];
    const crisisDetected = crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    res.json({
      message: randomResponse,
      crisisDetected,
      resources: crisisDetected ? [
        { name: '988 Suicide & Crisis Lifeline', number: '988' },
        { name: 'Crisis Text Line', number: '741741' }
      ] : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;