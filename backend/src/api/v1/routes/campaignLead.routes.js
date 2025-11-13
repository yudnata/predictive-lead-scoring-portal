const express = require('express');
const clController = require('../controllers/campaignLead.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Proteksi semua rute ini
router.use(protect);

// --- Rute khusus Sales ---
router.post('/assign', authorize('sales'), clController.assignLead);
router.get('/my-tracker', authorize('sales'), clController.getTracker);
router.patch(
  '/:campaignLeadId/status',
  authorize('sales'),
  clController.updateStatus
);

// --- Rute khusus Admin ---
router.patch(
  '/:campaignLeadId/admin-update-status',
  authorize('admin'),
  clController.adminUpdateStatus
);

module.exports = router;