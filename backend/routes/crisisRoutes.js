const express = require('express');
const router = express.Router();

// Crisis resources endpoint
router.get('/resources', (req, res) => {
  res.json({
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        number: '988',
        description: 'Call or text 988 for 24/7 support'
      },
      {
        name: 'Crisis Text Line',
        number: '741741',
        description: 'Text HOME to 741741'
      },
      {
        name: 'Veterans Crisis Line',
        number: '988',
        description: 'Press 1 after dialing'
      },
      {
        name: 'The Trevor Project',
        number: '866-488-7386',
        description: 'LGBTQ+ youth support'
      }
    ]
  });
});

module.exports = router;