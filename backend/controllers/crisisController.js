const CrisisAlert = require('../models/CrisisAlert');
const User = require('../models/User');

// @desc    Get crisis resources
// @route   GET /api/crisis/resources
exports.getResources = async (req, res) => {
  try {
    const resources = [
      {
        id: 1,
        name: '988 Suicide & Crisis Lifeline',
        number: '988',
        description: 'Call or text 988 for 24/7 confidential support',
        website: 'https://988lifeline.org',
        available: '24/7'
      },
      {
        id: 2,
        name: 'Crisis Text Line',
        number: '741741',
        description: 'Text HOME to 741741 to connect with a crisis counselor',
        website: 'https://www.crisistextline.org',
        available: '24/7'
      },
      {
        id: 3,
        name: 'Veterans Crisis Line',
        number: '988',
        description: 'Press 1 after dialing 988 for veterans support',
        website: 'https://www.veteranscrisisline.net',
        available: '24/7'
      },
      {
        id: 4,
        name: 'The Trevor Project',
        number: '866-488-7386',
        description: 'LGBTQ+ youth support',
        website: 'https://www.thetrevorproject.org',
        available: '24/7'
      },
      {
        id: 5,
        name: 'SAMHSA National Helpline',
        number: '800-662-4357',
        description: 'Mental health and substance abuse support',
        website: 'https://www.samhsa.gov/find-help/national-helpline',
        available: '24/7'
      },
      {
        id: 6,
        name: 'National Domestic Violence Hotline',
        number: '800-799-7233',
        description: 'Support for domestic violence situations',
        website: 'https://www.thehotline.org',
        available: '24/7'
      }
    ];

    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create crisis alert
// @route   POST /api/crisis/alert
exports.createAlert = async (req, res) => {
  try {
    const { severity, content, triggeredBy } = req.body;
    
    const alert = await CrisisAlert.create({
      userId: req.user?._id,
      severity: severity || 'MEDIUM',
      triggeredBy: triggeredBy || 'manual',
      content,
      status: 'ACTIVE'
    });

    // If user is logged in, get emergency contacts
    if (req.user) {
      const user = await User.findById(req.user._id);
      
      // In production, you would send SMS/email to emergency contacts here
      console.log('Emergency contacts:', user.emergencyContacts);
    }

    res.json({ 
      success: true, 
      alert,
      message: 'Crisis alert created. Help is on the way.',
      resources: await exports.getResources(req, res) 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get safety plan
// @route   GET /api/crisis/safety-plan
exports.getSafetyPlan = async (req, res) => {
  try {
    const safetyPlan = {
      warningSigns: [
        "Feeling hopeless or trapped",
        "Withdrawing from friends and family",
        "Increased substance use",
        "Sleeping too much or too little",
        "Extreme mood swings"
      ],
      copingStrategies: [
        "Call a crisis hotline",
        "Reach out to a trusted person",
        "Go to a safe location",
        "Remove access to harmful items",
        "Practice grounding techniques"
      ],
      emergencyContacts: req.user ? await User.findById(req.user._id).select('emergencyContacts') : [],
      professionalResources: [
        "Therapist: [Add your therapist's name and number]",
        "Psychiatrist: [Add your psychiatrist's name and number]",
        "Primary Care Doctor: [Add your doctor's name and number]"
      ],
      immediateActions: [
        "Call 988 Suicide & Crisis Lifeline",
        "Text HOME to 741741",
        "Go to nearest emergency room",
        "Call 911 if in immediate danger"
      ]
    };

    res.json({ success: true, safetyPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send emergency alert to contacts
// @route   POST /api/crisis/notify-contacts
exports.notifyEmergencyContacts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No emergency contacts found. Please add contacts first.' 
      });
    }

    // In production, you would send SMS/email to each contact
    const notifiedContacts = user.emergencyContacts.map(contact => ({
      name: contact.name,
      phone: contact.phone,
      notified: true,
      timestamp: new Date()
    }));

    // Create crisis alert
    await CrisisAlert.create({
      userId: req.user._id,
      severity: 'HIGH',
      triggeredBy: 'emergency-button',
      content: 'User activated emergency alert',
      notifiedEmergencyContacts: true,
      notifiedAt: new Date()
    });

    res.json({ 
      success: true, 
      message: 'Emergency contacts notified',
      contacts: notifiedContacts 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby crisis centers
// @route   GET /api/crisis/nearby
exports.getNearbyCenters = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // In production, you would use Google Places API or similar
    // Mock data for now
    const centers = [
      {
        name: 'City Crisis Center',
        address: '123 Main St, Anytown, USA',
        phone: '555-0123',
        distance: '0.5 miles',
        hours: '24/7',
        services: ['Crisis intervention', 'Emergency counseling', 'Referrals']
      },
      {
        name: 'Community Mental Health Center',
        address: '456 Oak Ave, Anytown, USA',
        phone: '555-0456',
        distance: '1.2 miles',
        hours: '8am-8pm',
        services: ['Counseling', 'Support groups', 'Medication management']
      },
      {
        name: 'University Hospital - Emergency Psychiatry',
        address: '789 College Blvd, Anytown, USA',
        phone: '555-0789',
        distance: '2.3 miles',
        hours: '24/7',
        services: ['Emergency psychiatric care', 'Crisis stabilization', 'Inpatient care']
      }
    ];

    res.json({ success: true, centers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get calming exercises
// @route   GET /api/crisis/calming-exercises
exports.getCalmingExercises = async (req, res) => {
  try {
    const exercises = [
      {
        id: 1,
        title: '5-4-3-2-1 Grounding Technique',
        steps: [
          'Look around and name 5 things you can see',
          'Notice 4 things you can touch',
          'Listen for 3 things you can hear',
          'Identify 2 things you can smell',
          'Name 1 thing you can taste'
        ],
        duration: '2-3 minutes'
      },
      {
        id: 2,
        title: 'Deep Breathing',
        steps: [
          'Find a comfortable position',
          'Breathe in slowly through your nose for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly through your mouth for 6 counts',
          'Repeat 5-10 times'
        ],
        duration: '3-5 minutes'
      },
      {
        id: 3,
        title: 'Progressive Muscle Relaxation',
        steps: [
          'Tense your feet for 5 seconds, then release',
          'Tense your calves for 5 seconds, then release',
          'Continue up through your body to your face',
          'Notice the difference between tension and relaxation'
        ],
        duration: '5-10 minutes'
      },
      {
        id: 4,
        title: 'Mindful Observation',
        steps: [
          'Choose an object to focus on',
          'Notice its color, texture, and shape',
          'Observe it as if seeing it for the first time',
          'Spend 2-3 minutes in quiet observation'
        ],
        duration: '3 minutes'
      }
    ];

    res.json({ success: true, exercises });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};