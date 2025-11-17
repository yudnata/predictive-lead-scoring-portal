const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

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

const findById = async (campaignId) => {
  const query = {
    text: 'SELECT * FROM tb_campaigns WHERE campaign_id = $1',
    values: [campaignId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

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