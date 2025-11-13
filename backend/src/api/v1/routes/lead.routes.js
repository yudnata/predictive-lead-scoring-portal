const express = require('express');
const leadController = require('../controllers/lead.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Semua rute di bawah ini diproteksi
router.use(protect);

// @route   GET /api/v1/leads
// @desc    Get all leads (Admin see all, Sales see all)
// @access  Private (Admin, Sales)
router.get('/', authorize('admin', 'sales'), leadController.getAllLeads);

// @route   POST /api/v1/leads
// @desc    Create new lead manually (Admin only)
// @access  Private (Admin)
router.post('/', authorize('admin'), leadController.createLead);

// @route   POST /api/v1/leads/upload-csv
// @desc    Upload leads via CSV (Admin only)
// @access  Private (Admin)
router.post('/upload-csv', authorize('admin'), leadController.uploadLeadsCSV);

// @route   GET /api/v1/leads/:leadId
// @desc    Get lead detail (Admin, Sales)
// @access  Private (Admin, Sales)
router.get('/:leadId', authorize('admin', 'sales'), leadController.getLeadById);

// @route   PATCH /api/v1/leads/:leadId
// @desc    Update lead detail (Admin only)
// @access  Private (Admin)
router.patch('/:leadId', authorize('admin'), leadController.updateLead);

// ... (Rute untuk Notes: POST /api/v1/leads/:leadId/notes) ...

module.exports = router;