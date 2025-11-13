const express = require('express');
const leadController = require('../controllers/lead.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware'); // Impor multer
const noteRoutes = require('./note.routes'); // Impor rute notes

const router = express.Router();

// Proteksi semua rute
router.use(protect);

// @route   GET /api/v1/leads
// @desc    Get all leads (Admin, Sales)
// @access  Private (Admin, Sales)
router.get('/', authorize('admin', 'sales'), leadController.getAllLeads);

// @route   POST /api/v1/leads
// @desc    Create new lead (Admin only)
// @access  Private (Admin)
router.post('/', authorize('admin'), leadController.createLead);

// @route   POST /api/v1/leads/upload-csv
// @desc    Upload leads via CSV (Admin only)
// @access  Private (Admin)
router.post(
  '/upload-csv',
  authorize('admin'),
  upload.single('file'),
  leadController.uploadLeadsCSV
);

// Rute dengan parameter HARUS di bawah rute yang lebih spesifik

// @route   GET /api/v1/leads/:leadId
// @desc    Get single lead (Admin, Sales)
// @access  Private (Admin, Sales)
router.get('/:leadId', authorize('admin', 'sales'), leadController.getLeadById);

// @route   PATCH /api/v1/leads/:leadId
// @desc    Update lead (Admin only)
// @access  Private (Admin)
router.patch('/:leadId', authorize('admin'), leadController.updateLead);

// @route   DELETE /api/v1/leads/:leadId
// @desc    Delete lead (Admin only)
// @access  Private (Admin)
router.delete('/:leadId', authorize('admin'), leadController.deleteLead);

// Rute untuk Notes (Nested) - HARUS DI BAGIAN AKHIR
// Ini akan menangani /api/v1/leads/:leadId/notes
router.use('/:leadId/notes', noteRoutes);

module.exports = router;