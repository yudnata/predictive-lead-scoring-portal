const db = require('../../../config/database');

/**
 * Membuat note baru
 * @param {object} noteData - { lead_id, user_id, note_content, campaign_id }
 * @returns {Promise<object>} Note yang baru dibuat (sudah di-join)
 */
const create = async (noteData) => {
  const { lead_id, user_id, note_content, campaign_id } = noteData;

  const query = {
    text: `
      INSERT INTO tb_notes (lead_id, user_id, note_content, campaign_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `,
    values: [lead_id, user_id, note_content, campaign_id || null],
  };
  
  const { rows } = await db.query(query);
  const newNoteId = rows[0].notes_id;

  // Kembalikan data yang sudah di-join agar bisa langsung ditampilkan di UI
  return findByIdJoined(newNoteId);
};

/**
 * Mencari semua notes untuk satu lead ID (di-join)
 * @param {number} leadId
 * @returns {Promise<Array>} Daftar notes
 */
const findAllByLeadId = async (leadId) => {
  const query = {
    text: `
      SELECT 
        n.notes_id,
        n.note_content,
        n.created_at,
        u.user_id, -- (Ditambahkan untuk cek otorisasi)
        u.full_name AS sales_name,
        c.campaign_name
      FROM tb_notes n
      JOIN tb_users u ON n.user_id = u.user_id
      LEFT JOIN tb_campaigns c ON n.campaign_id = c.campaign_id
      WHERE n.lead_id = $1
      ORDER BY n.created_at DESC
    `,
    values: [leadId],
  };
  const { rows } = await db.query(query);
  return rows;
};

/**
 * Mencari satu note berdasarkan ID (di-join, helper untuk create)
 * @param {number} noteId
 * @returns {Promise<object>}
 */
const findByIdJoined = async (noteId) => {
  const query = {
    text: `
      SELECT 
        n.notes_id,
        n.note_content,
        n.created_at,
        u.user_id,
        u.full_name AS sales_name,
        c.campaign_name
      FROM tb_notes n
      JOIN tb_users u ON n.user_id = u.user_id
      LEFT JOIN tb_campaigns c ON n.campaign_id = c.campaign_id
      WHERE n.notes_id = $1
    `,
    values: [noteId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * FUNGSI BARU: Mencari note mentah (untuk cek kepemilikan)
 * @param {number} noteId
 * @returns {Promise<object>}
 */
const findRawById = async (noteId) => {
  const { rows } = await db.query('SELECT * FROM tb_notes WHERE notes_id = $1', [
    noteId,
  ]);
  return rows[0];
};

/**
 * FUNGSI BARU: Menghapus note berdasarkan ID
 * @param {number} noteId
 */
const deleteById = async (noteId) => {
  await db.query('DELETE FROM tb_notes WHERE notes_id = $1', [noteId]);
};

module.exports = {
  create,
  findAllByLeadId,
  findRawById, // Ditambahkan
  deleteById, // Ditambahkan
};