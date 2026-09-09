const express = require('express');
const router = express.Router();
const verifyAdminKey = require('../middleware/verifyAdminKey');
const { adminRateLimiter } = require('../middleware/rateLimiter');
const adminController = require('../controllers/admin.controller');

// All admin routes require admin rate limiting and admin key verification
router.use(adminRateLimiter);
router.use(verifyAdminKey);

// POST /api/admin/labs - Create a new lab
router.post('/labs', adminController.createLab);

// PUT /api/admin/labs/:labId - Update an existing lab
router.put('/labs/:labId', adminController.updateLab);

// PATCH /api/admin/labs/:labId/deactivate - Soft-deactivate a lab
router.patch('/labs/:labId/deactivate', adminController.deactivateLab);

module.exports = router;
