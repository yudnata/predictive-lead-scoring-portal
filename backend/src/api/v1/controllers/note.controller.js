const noteService = require('../services/note.service');

// @desc    Membuat note baru untuk lead
// @route   POST /api/v1/leads/:leadId/notes
// @access  Private (Admin, Sales)
exports.createNote = async (req, res, next) => {
  try {
    const { leadId } = req.params; // Diambil dari URL
    const userId = req.user.user_id; // Diambil dari token (via middleware 'protect')
    
    const note = await noteService.createNoteForLead(leadId, userId, req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mengambil semua notes untuk lead
// @route   GET /api/v1/leads/:leadId/notes
// @access  Private (Admin, Sales)
exports.getAllNotesForLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    
    const notes = await noteService.getNotesForLead(leadId);
    
    res.status(200).json({
      status: 'success',
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Menghapus note
// @route   DELETE /api/v1/leads/:leadId/notes/:noteId
// @access  Private (Admin, Sales - Otorisasi di service)
exports.deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const user = req.user; // Diambil dari token

    await noteService.deleteNoteById(noteId, user);
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};