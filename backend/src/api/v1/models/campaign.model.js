const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

const create = async (campaignData) => {
  const {
    campaign_name,
    campaign_start_date,
    campaign_end_date,
    campaign_desc,
    campaign_is_active,
  } = campaignData;

  const query = {
    text: `
      INSERT INTO tb_campaigns 
        (campaign_name, campaign_start_date, campaign_end_date, campaign_desc, campaign_is_active, created_at, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
    values: [
      campaign_name,
      campaign_start_date || null,
      campaign_end_date || null,
      campaign_desc || null,
      campaign_is_active === undefined ? true : campaign_is_active,
    ],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const findAll = async (options) => {
  const { limit, offset, search, userId } = options; // Ambil userId

  let queryText = `SELECT c.* FROM tb_campaigns c`;
  const queryValues = [];
  let paramIndex = 1;
  let whereClauses = [];

  // 1. LOGIKA FILTER SALES ASSIGNMENT
  if (userId) {
    queryText += ` JOIN tb_campaign_assignments ca ON c.campaign_id = ca.campaign_id`;
    whereClauses.push(`ca.user_id = $${paramIndex++}`);
    queryValues.push(userId);
  }

  // 2. LOGIKA SEARCH
  if (search) {
    whereClauses.push(`c.campaign_name ILIKE $${paramIndex++}`);
    queryValues.push(`%${search}%`);
  }
  
  // Apply WHERE clauses
  if (whereClauses.length > 0) {
    queryText += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // 3. LOGIKA PAGINASI & URUTAN
  queryText += ` ORDER BY c.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

//   if (search) {
//     queryText += ` WHERE campaign_name ILIKE $${paramIndex++}`;
//     queryValues.push(`%${search}%`);
//   }

//   queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
//   queryValues.push(limit, offset);

//   const { rows } = await db.query(queryText, queryValues);
//   return rows;
// };

const countAll = async (options) => {
  const { search, userId } = options; // Ambil userId
  
  let queryText = `SELECT COUNT(c.campaign_id) FROM tb_campaigns c`;
  const queryValues = [];
  let paramIndex = 1;
  let whereClauses = [];

  // 1. LOGIKA FILTER SALES ASSIGNMENT
  if (userId) {
    queryText += ` JOIN tb_campaign_assignments ca ON c.campaign_id = ca.campaign_id`;
    whereClauses.push(`ca.user_id = $${paramIndex++}`);
    queryValues.push(userId);
  }

  // 2. LOGIKA SEARCH
  if (search) {
    whereClauses.push(`c.campaign_name ILIKE $${paramIndex++}`);
    queryValues.push(`%${search}%`);
  }

  // Apply WHERE clauses
  if (whereClauses.length > 0) {
    queryText += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

// const countAll = async (options) => {
//   const { search } = options;
//   let queryText = 'SELECT COUNT(*) FROM tb_campaigns';
//   const queryValues = [];

//   if (search) {
//     queryText += ' WHERE campaign_name ILIKE $1';
//     queryValues.push(`%${search}%`);
//   }

//   const { rows } = await db.query(queryText, queryValues);
//   return parseInt(rows[0].count, 10);
// };

const findById = async (campaignId) => {
  const query = {
    text: `
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'user_id', u.user_id,
              'full_name', u.full_name, 
              'user_email', u.user_email 
            )
          ) FILTER (WHERE u.user_id IS NOT NULL),
         '[]'
        ) AS assigned_sales
      FROM tb_campaigns c
      LEFT JOIN tb_campaign_assignments ca ON c.campaign_id = ca.campaign_id
      LEFT JOIN tb_users u ON ca.user_id = u.user_id
      WHERE c.campaign_id = $1
      GROUP BY c.campaign_id
    `,
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
    campaign_is_active,
  } = campaignData;

  const query = {
    text: `
      UPDATE tb_campaigns
      SET 
        campaign_name = $1,
        campaign_start_date = $2,
        campaign_end_date = $3,
        campaign_desc = $4,
        campaign_is_active = $5,
        updated_at = NOW()
      WHERE campaign_id = $6
      RETURNING *
    `,
    values: [
      campaign_name,
      campaign_start_date || null,
      campaign_end_date || null,
      campaign_desc || null,
      campaign_is_active,
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