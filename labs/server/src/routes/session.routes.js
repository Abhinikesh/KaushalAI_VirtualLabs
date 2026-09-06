const express = require('express');
const verifyLabAccessToken = require('../middleware/verifyLabAccessToken');

const router = express.Router();

/**
 * GET /api/lab-session/verify
 * Confirms lab access token validity and returns decoded student & lab session metadata.
 */
router.get('/verify', verifyLabAccessToken, (req, res) => {
  const { user_id, course_id, lab_id, user_name, exp } = req.labAccess;

  res.status(200).json({
    status: 'ok',
    valid: true,
    session: {
      user_id,
      course_id,
      lab_id,
      user_name,
      expires_at: exp ? new Date(exp * 1000).toISOString() : null
    }
  });
});

module.exports = router;
