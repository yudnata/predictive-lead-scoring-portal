const noteModel = require('../models/note.model');
const leadModel = require('../models/lead.model');
const ApiError = require('../utils/apiError');

/**
 * Membuat note baru untuk lead
 * @param {number} leadId - Dari URL param
 * @param {number} userId - Dari req.user (Sales)
 * @param {object} noteBody - { note_content, campaign_id }
 * @returns {Promise<object>}
 */
const createNoteForLead = async (leadId, userId, noteBody) => {
  const { note_content, campaign_id } = noteBody;

  // 1. Validasi input
  if (!note_content) {
    throw new ApiError(400, 'Isi catatan (note_content) tidak boleh kosong');
  }

  // 2. Cek apakah lead-nya ada
  const lead = await leadModel.findFullLeadById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead tidak ditemukan');
  }

  // 3. Siapkan data
  const noteData = {
    lead_id: leadId,
    user_id: userId,
    note_content,
    campaign_id, // Boleh null
  };

  // 4. Buat note
  return noteModel.create(noteData);
};

/**
 * Mengambil semua notes untuk lead
 * @param {number} leadId
 * @returns {Promise<Array>}
 */
const getNotesForLead = async (leadId) => {
  // Cek dulu lead-nya
  const lead = await leadModel.findFullLeadById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead tidak ditemukan');
  }
  
  return noteModel.findAllByLeadId(leadId);
};

/**
 * FUNGSI YANG DIUPDATE: Menghapus note
 * @param {number} noteId - ID catatan
 * @param {object} user - User yang login (dari req.user)
 */
const deleteNoteById = async (noteId, user) => {
  // 1. Cek apakah note-nya ada
  const note = await noteModel.findRawById(noteId);
  if (!note) {
    throw new ApiError(404, 'Catatan tidak ditemukan');
  }

  // 2. Cek Otorisasi (LOGIKA BARU YANG LEBIH SIMPEL)
  // Route sudah menjamin user.role_name === 'sales'
  // Sales hanya boleh hapus miliknya sendiri
  if (note.user_id !== user.user_id) {
    throw new ApiError(403, 'Forbidden: Anda hanya bisa menghapus catatan milik Anda sendiri');
  }

  // 3. Hapus note
  await noteModel.deleteById(noteId);
};

module.exports = {
  createNoteForLead,
  getNotesForLead,
  deleteNoteById,
};