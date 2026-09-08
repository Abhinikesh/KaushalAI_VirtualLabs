const express = require('express');
const {
  getLabsList,
  getLabById,
  startLabAttempt,
  completeLabAttempt
} = require('../controllers/labs.controller');
const verifyLabAccess = require('../middleware/verifyLabAccess');

const router = express.Router();

// ── Public Directory Endpoints ──────────────────────────────────────────────
// GET /api/labs - List all active labs (lightweight list for catalog)
router.get('/labs', getLabsList);

// GET /api/labs/:labId - Fetch full lab details including config (open read)
router.get('/labs/:labId', getLabById);

// ── Protected Attempt Endpoints (Require valid verified JWT session) ─────────
// POST /api/lab-attempts/start - Start or resume an in-progress lab attempt
router.post('/lab-attempts/start', verifyLabAccess, startLabAttempt);

// POST /api/lab-attempts/:attemptId/complete - Complete attempt and save results
router.post('/lab-attempts/:attemptId/complete', verifyLabAccess, completeLabAttempt);

module.exports = router;
