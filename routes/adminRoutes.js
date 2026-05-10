const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');

// Route for bulk onboarding: POST /api/admin/onboard
router.post('/onboard', upload.single('file'), adminController.bulkOnboard);

// Route for system stats: GET /api/admin/stats
router.get('/stats', adminController.getStats);

module.exports = router;