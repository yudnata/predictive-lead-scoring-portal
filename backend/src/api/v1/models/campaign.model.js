const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

/**
 * Membuat campaign baru
 * @param {object} campaignData - { campaign_name, campaign_start_date, ... }
 * @returns {Promise<object>} Campaign yang baru dibuat
 */
const create = async (campaignData) => {
  const {
    campaign_name,
    campaign_start_date,
    campaign_end_date,
    campaign_desc,
    campaign_status,
  } = campaignData;

  const query = {
    text: `
      INSERT INTO tb_campaigns 
        (campaign_name, campaign_start_date, campaign_end_date, campaign_desc, campaign_status, created_at, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
    values: [
      campaign_name,
      campaign_start_date || null,
      campaign_end_date || null,
      campaign_desc || null,
      campaign_status || 'Aktif',
    ],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * Mencari semua campaign dengan pagination dan search
 * @param {object} options - { limit, offset, search }
 * @returns {Promise<Array>} Daftar campaign
 */
const findAll = async (options) => {
  const { limit, offset, search } = options;
  let queryText = 'SELECT * FROM tb_campaigns';
  const queryValues = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` WHERE campaign_name ILIKE $${paramIndex++}`;
    queryValues.push(`%${search}%`);
  }

  queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

/**
 * Menghitung total campaign (untuk pagination)
 * @param {object} options - { search }
 * @returns {Promise<number>} Jumlah total campaign
 */
const countAll = async (options) => {
  const { search } = options;
  let queryText = 'SELECT COUNT(*) FROM tb_campaigns';
  const queryValues = [];

  if (search) {
    queryText += ' WHERE campaign_name ILIKE $1';
    queryValues.push(`%${search}%`);
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

/**
 * Mencari campaign berdasarkan ID
 * @param {number} campaignId
 * @returns {Promise<object>} Detail campaign
 */
const findById = async (campaignId) => {
  const query = {
    text: 'SELECT * FROM tb_campaigns WHERE campaign_id = $1',
    values: [campaignId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * Meng-update campaign berdasarkan ID
 * @param {number} campaignId
 * @param {object} campaignData - Data campaign yang akan di-update
 * @returns {Promise<object>} Campaign yang sudah di-update
 */
const update = async (campaignId, campaignData) => {
  const {
    campaign_name,
    campaign_start_date,
    campaign_end_date,
    campaign_desc,
    campaign_status,
  } = campaignData;

  const query = {
    text: `
      UPDATE tb_campaigns
      SET 
        campaign_name = $1,
        campaign_start_date = $2,
        campaign_end_date = $3,
        campaign_desc = $4,
        campaign_status = $5,
        updated_at = NOW()
      WHERE campaign_id = $6
      RETURNING *
    `,
    values: [
      campaign_name,
      campaign_start_date || null,
      campaign_end_date || null,
      campaign_desc || null,
      campaign_status,
      campaignId,
    ],
  };
  const { rows } = await db.query(query);
  if (rows.length === 0) {
    throw new ApiError(404, 'Campaign tidak ditemukan');
  }
  return rows[0];
};

/**
 * Menghapus campaign berdasarkan ID
 * @param {number} campaignId
 * @returns {Promise<object>} Campaign yang dihapus
 */
const deleteById = async (campaignId) => {
  const query = {
    text: 'DELETE FROM tb_campaigns WHERE campaign_id = $1 RETURNING *',
    values: [campaignId],
  };
  const { rows } = await db.query(query);
  if (rows.length === 0) {
    throw new ApiError(404, 'Campaign tidak ditemukan');
  }
  return rows[0];
};

module.exports = {
  create,
  findAll,
  countAll,
  findById,
  update,
  deleteById,
};