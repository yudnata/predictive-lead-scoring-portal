const express = require('express');
const noteController = require('../controllers/note.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// PENTING: mergeParams: true
// agar bisa mengakses :leadId dari parent router (lead.routes.js)
const router = express.Router({ mergeParams: true });

// Proteksi semua rute notes
router.use(protect);
// --- PERUBAHAN LOGIKA ---
// Hanya 'sales' yang bisa mengakses notes
router.use(authorize('sales')); 

// Rute untuk /api/v1/leads/:leadId/notes
router
  .route('/')
  .post(noteController.createNote)
  .get(noteController.getAllNotesForLead);

// Rute BARU untuk /api/v1/leads/:leadId/notes/:noteId
router
  .route('/:noteId')
  .delete(noteController.deleteNote);
  // (Nanti bisa ditambahkan .patch(noteController.updateNote) di sini)

module.exports = router;