const express = require('express');
const verifyLabAccess = require('../middleware/verifyLabAccess');

const router = express.Router();

/**
 * GET /api/lab-session/verify
 * Confirms lab access token validity and returns decoded student & lab session metadata.
 * Protected by verifyLabAccess.
 */
router.get('/verify', verifyLabAccess, (req, res) => {
  const { user_id, user_name, lab_id, course_context, exp } = req.labAccess;

  res.status(200).json({
    status: 'ok',
    valid: true,
    user_id,
    user_name,
    lab_id,
    course_context,
    expires_at: exp ? new Date(exp * 1000).toISOString() : null,
    session: {
      user_id,
      user_name,
      lab_id,
      course_context,
      expires_at: exp ? new Date(exp * 1000).toISOString() : null
    }
  });
});

module.exports = router;
