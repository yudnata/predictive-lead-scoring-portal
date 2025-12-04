const express = require('express');
const noteController = require('../controllers/note.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const router = express.Router({ mergeParams: true });

router.use(protect);

router.use(authorize('sales'));

router.route('/').post(noteController.createNote).get(noteController.getAllNotesForLead);

router.route('/:noteId').delete(noteController.deleteNote);

module.exports = router;
