const express = require('express');
const { getLabById, saveLabAttempt } = require('../controllers/labs.controller');
const verifyLabAccessToken = require('../middleware/verifyLabAccessToken');

const router = express.Router();

// GET /api/labs/:labId - Fetch lab configuration with token scope enforcement
router.get('/labs/:labId', verifyLabAccessToken, getLabById);

// POST /api/lab-attempts - Record lab completion and score
router.post('/lab-attempts', verifyLabAccessToken, saveLabAttempt);

module.exports = router;
