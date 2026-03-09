const Chat = require('../models/Chat');
const CrisisAlert = require('../models/CrisisAlert');

// Crisis keywords for detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die',
  'hurt myself', 'self-harm', 'cut myself', 'no reason to live',
  'better off dead', 'give up', 'can\'t go on'
];

// @desc    Send message to AI
// @route   POST /api/ai/chat
exports.sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user?._id;

    // Check for crisis keywords
    const crisisDetected = CRISIS_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (crisisDetected && userId) {
      // Create crisis alert
      await CrisisAlert.create({
        userId,
        severity: 'HIGH',
        triggeredBy: 'ai-chat',
        content: message.substring(0, 500),
        status: 'ACTIVE'
      });
    }

    // Mock AI responses (replace with actual OpenAI integration)
    const responses = [
      "I hear you. How does that make you feel?",
      "That sounds challenging. Would you like to explore some coping strategies?",
      "Thank you for sharing that with me. You're doing great by reaching out.",
      "Remember to be kind to yourself. What's one small thing you can do for yourself today?",
      "I'm here to listen. Would you like to tell me more about that?",
      "It's okay to feel this way. Many people experience similar feelings.",
      "Let's take a deep breath together. Breathe in... and out...",
      "What would be most helpful for you right now?"
    ];

    const aiResponse = responses[Math.floor(Math.random() * responses.length)];

    // Save chat if user is logged in
    if (userId) {
      const chat = new Chat({
        userId,
        messages: [
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: aiResponse, timestamp: new Date() }
        ]
      });
      await chat.save();
    }

    res.json({
      success: true,
      message: aiResponse,
      crisisDetected,
      resources: crisisDetected ? [
        { name: '988 Suicide & Crisis Lifeline', number: '988', description: 'Call or text 988' },
        { name: 'Crisis Text Line', number: '741741', description: 'Text HOME to 741741' }
      ] : null
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat history
// @route   GET /api/ai/history
exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Analyze sentiment
// @route   POST /api/ai/analyze
exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    // Mock sentiment analysis
    const words = text.toLowerCase().split(' ');
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'love', 'joy'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed'];

    let score = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    const normalizedScore = (score + 5) / 10; // Convert to 0-1 range
    const sentiment = normalizedScore > 0.6 ? 'positive' : normalizedScore < 0.4 ? 'negative' : 'neutral';

    res.json({
      success: true,
      sentiment,
      score: normalizedScore,
      confidence: 0.8
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get coping strategies
// @route   GET /api/ai/strategies/:emotion
exports.getCopingStrategies = async (req, res) => {
  try {
    const { emotion } = req.params;

    const strategies = {
      anxious: [
        "Take 5 deep breaths, counting to 4 on inhale and 6 on exhale",
        "Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
        "Go for a short walk outside",
        "Listen to calming music or a guided meditation"
      ],
      sad: [
        "Reach out to a trusted friend or family member",
        "Write down three things you're grateful for",
        "Watch a favorite comedy or uplifting video",
        "Engage in a creative activity like drawing or journaling"
      ],
      angry: [
        "Step away from the situation and take a time-out",
        "Squeeze a stress ball or pillow",
        "Go for a run or do intense exercise",
        "Practice progressive muscle relaxation"
      ],
      stressed: [
        "Make a list of what you can and cannot control",
        "Break down tasks into smaller, manageable steps",
        "Take a 15-minute break to do something you enjoy",
        "Try a quick meditation or breathing exercise"
      ],
      default: [
        "Take a moment to check in with yourself",
        "Practice self-compassion: treat yourself like you would a good friend",
        "Do one small act of self-care",
        "Remember that all feelings are temporary"
      ]
    };

    res.json({
      success: true,
      strategies: strategies[emotion] || strategies.default
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};