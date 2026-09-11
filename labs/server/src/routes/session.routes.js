const express = require('express');
const jwt = require('jsonwebtoken');
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

/**
 * POST /api/lab-session/standalone-token
 * Issues a token for independent sandbox practice without requiring an external LMS handoff.
 * Enables standalone workbench learners to start and complete labs with persistent database tracking.
 */
router.post('/standalone-token', (req, res) => {
  try {
    const { lab_id, user_name } = req.body;
    if (!lab_id) {
      return res.status(400).json({ error: 'BadRequest', message: 'lab_id is required' });
    }

    const secret = process.env.JWT_SHARED_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'InternalServerError', message: 'JWT configuration error' });
    }

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const payload = {
      user_id: `learner_standalone_${randomSuffix}`,
      user_name: user_name || 'Practice Learner',
      lab_id: String(lab_id),
      course_context: 'Independent Practice'
    };

    // 24 hour expiry for comfortable independent practice
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    res.status(200).json({
      status: 'ok',
      token,
      session: {
        ...payload,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

module.exports = router;
