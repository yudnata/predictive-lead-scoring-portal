const noteService = require('../services/note.service');

exports.createNote = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const userId = req.user.user_id;

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

exports.deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const user = req.user;

    await noteService.deleteNoteById(noteId, user);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
