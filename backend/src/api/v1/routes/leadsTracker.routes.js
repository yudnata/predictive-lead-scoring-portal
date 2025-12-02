const express = require('express');
const leadsTrackerController = require('../controllers/leadsTracker.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Semua rute di sini memerlukan proteksi dan hanya dapat diakses oleh Sales
router.use(protect);
router.use(authorize('sales'));

// GET /api/v1/leads-tracker?page=...&user_id=...
// Endpoint untuk mengambil semua leads yang di-assign ke sales tertentu.
router.get('/', leadsTrackerController.getAllLeadsForSales);

// PATCH /api/v1/leads-tracker/:leadCampaignId/status
// Endpoint untuk mengupdate status lead (misalnya, menjadi "Sedang Dihubungi")
router.patch('/:leadCampaignId/status', leadsTrackerController.updateLeadStatus);

module.exports = router;