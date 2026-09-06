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

/**
 * GET /api/lab-session/demo-token
 * Generates an authentic signed token for live presentation and testing demos.
 */
router.get('/demo-token', (req, res) => {
  const jwt = require('jsonwebtoken');
  const lab_id = req.query.lab_id || 'lab-sql-employees';
  const secret = process.env.JWT_SHARED_SECRET || 'kaushalai_virtual_labs_secure_jwt_shared_secret_2026_x89a';
  const token = jwt.sign(
    {
      user_id: '6a9716b23a22a65916c92285',
      course_id: '6a996d6d266163e0a9606c61',
      lab_id,
      user_name: 'Priya Nair (Statistical Officer)'
    },
    secret,
    { expiresIn: '2h' }
  );
  res.status(200).json({ status: 'ok', token, lab_id });
});

module.exports = router;
