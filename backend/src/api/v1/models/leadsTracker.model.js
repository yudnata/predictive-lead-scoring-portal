const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

// --- PENCARIAN DATA LEADS ---

const findAllBySales = async (options) => {
  const { limit, offset, search, campaignId, minStatusName } = options;
  let queryText = `
    SELECT
        cl.campaignleads_id AS lead_campaign_id,
        cl.lead_id,
        cl.campaign_id,
        cl.user_id,
        l.lead_name,
        c.campaign_name,
        s.status,
        ls.lead_score AS score,
        u.full_name AS tracked_by_name
    FROM tb_campaign_leads cl
    JOIN tb_leads l ON cl.lead_id = l.lead_id
    JOIN tb_campaigns c ON cl.campaign_id = c.campaign_id
    JOIN tb_status s ON cl.status_id = s.status_id
    JOIN tb_users u ON cl.user_id = u.user_id
    LEFT JOIN tb_leads_score ls ON cl.lead_id = ls.lead_id 
    WHERE 1=1
`;
  const queryValues = [];
  let paramIndex = 1;
  let whereClauses = [];

// Outbound Detail Page
 if (minStatusName === 'NOT_BELUM_DIHUBUNGI') {
    // Mengecualikan status_id dari status 'Belum Dihubungi'
    queryText += `
        AND cl.status_id <> (SELECT status_id FROM tb_status WHERE status = 'Belum Dihubungi' LIMIT 1)
    `;
 }

  if (campaignId) {
    whereClauses.push(`cl.campaign_id = $${paramIndex++}`);
    queryValues.push(campaignId);
  }

  if (search) {
    whereClauses.push(`l.lead_name ILIKE $${paramIndex++}`);
    queryValues.push(`%${search}%`);
  }

  if (whereClauses.length > 0) {
    queryText += ` AND ${whereClauses.join(' AND ')}`;
  }

  queryText += ` ORDER BY l.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

const countAllBySales = async (options) => {
  const { search, campaignId, minStatusName } = options;
  let queryText = `
    SELECT COUNT(cl.campaignleads_id)
    FROM tb_campaign_leads cl
    JOIN tb_leads l ON cl.lead_id = l.lead_id
    WHERE 1=1
`;
  const queryValues = [];
  let paramIndex = 1;

 if (minStatusName === 'NOT_BELUM_DIHUBUNGI') {
    queryText += `
        AND cl.status_id <> (SELECT status_id FROM tb_status WHERE status = 'Belum Dihubungi' LIMIT 1)
    `;
 }

 if (campaignId) {
    queryText += ` AND cl.campaign_id = $${paramIndex++}`;
    queryValues.push(campaignId);
  }

  if (search) {
    queryText += ` AND l.lead_name ILIKE $${paramIndex++}`;
    queryValues.push(`%${search}%`);
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

// --- UPDATE STATUS ---

const findStatusByName = async (statusName) => {
    const { rows } = await db.query(
        'SELECT status_id, status FROM tb_status WHERE status ILIKE $1',
        [statusName]
    );
    return rows[0];
}

const updateStatus = async (leadCampaignId, statusId, userId) => {
    const query = {
        text: `
            UPDATE tb_campaign_leads
            SET 
                status_id = $1,
                user_id = $2,
                updated_at = NOW()
            WHERE campaignleads_id = $3
            RETURNING *
        `,
        values: [statusId, userId, leadCampaignId],
    };
    const { rows } = await db.query(query);
    if (rows.length === 0) {
        throw new ApiError(404, 'Lead Campaign tidak ditemukan atau tidak diizinkan diupdate');
    }
    return rows[0];
};

const createStatusHistory = async (leadId, campaignId, statusId, changedByUserId) => {
    const query = {
        text: `
            INSERT INTO tb_lead_status_history 
                (lead_id, campaign_id, status_id, changed_by)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
        values: [leadId, campaignId, statusId, changedByUserId],
    };
    const { rows } = await db.query(query);
    return rows[0];
};

module.exports = {
  findAllBySales,
  countAllBySales,
  findStatusByName,
  updateStatus,
  createStatusHistory,
};