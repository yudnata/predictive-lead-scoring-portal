const noteModel = require('../models/note.model');
const leadModel = require('../models/lead.model');
const ApiError = require('../utils/apiError');

const createNoteForLead = async (leadId, userId, noteBody) => {
  const { note_content, campaign_id } = noteBody;

  if (!note_content) {
    throw new ApiError(400, 'Isi catatan (note_content) tidak boleh kosong');
  }

  const lead = await leadModel.findFullLeadById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead tidak ditemukan');
  }

  const noteData = {
    lead_id: leadId,
    user_id: userId,
    note_content,
    campaign_id,
  };

  return noteModel.create(noteData);
};

const getNotesForLead = async (leadId) => {
  const lead = await leadModel.findFullLeadById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead tidak ditemukan');
  }
  
  return noteModel.findAllByLeadId(leadId);
};

const deleteNoteById = async (noteId, user) => {
  const note = await noteModel.findRawById(noteId);
  if (!note) {
    throw new ApiError(404, 'Catatan tidak ditemukan');
  }

  if (note.user_id !== user.user_id) {
    throw new ApiError(403, 'Forbidden: Anda hanya bisa menghapus catatan milik Anda sendiri');
  }

  await noteModel.deleteById(noteId);
};

module.exports = {
  createNoteForLead,
  getNotesForLead,
  deleteNoteById,
};