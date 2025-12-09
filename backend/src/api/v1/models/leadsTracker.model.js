const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

const findAllBySales = async (options) => {
  const { limit, offset, search, campaignId, minStatusName, minScore, maxScore, userId } = options;
  let queryText = `
    SELECT
        cl.campaignleads_id AS lead_campaign_id,
        cl.lead_id,
        cl.campaign_id,
        cl.user_id,
        l.lead_name,
        l.lead_phone_number,
        l.lead_email,
        l.lead_age,
        c.campaign_name,
        s.status,
        ls.lead_score AS score,
        u.full_name AS tracked_by_name,
        j.job_name,
        m.marital_status,
        e.education_level,
        d.lead_balance,
        d.lead_housing_loan,
        d.lead_loan,
        d.last_contact_day,
        d.month_id,
        d.last_contact_duration_sec,
        d.campaign_count,
        d.pdays,
        d.prev_contact_count,
        po.poutcome_name,
        d.updated_at as detail_updated_at,
        latest_activity.outcome AS latest_outcome
    FROM tb_campaign_leads cl
    JOIN tb_leads l ON cl.lead_id = l.lead_id
    JOIN tb_campaigns c ON cl.campaign_id = c.campaign_id
    JOIN tb_status s ON cl.status_id = s.status_id
    JOIN tb_users u ON cl.user_id = u.user_id
    LEFT JOIN tb_leads_score ls ON cl.lead_id = ls.lead_id
    LEFT JOIN tb_job j ON l.job_id = j.job_id
    LEFT JOIN tb_marital m ON l.marital_id = m.marital_id
    LEFT JOIN tb_education e ON l.education_id = e.education_id
    LEFT JOIN tb_leads_detail d ON l.lead_id = d.lead_id
    LEFT JOIN tb_poutcome po ON d.poutcome_id = po.poutcome_id
    LEFT JOIN LATERAL (
        SELECT outcome
        FROM tb_outbound_activities oa
        WHERE oa.lead_id = cl.lead_id
          AND oa.lead_campaign_id = cl.campaignleads_id
        ORDER BY oa.created_at DESC
        LIMIT 1
    ) latest_activity ON true
    WHERE 1=1
`;
  const queryValues = [];
  let paramIndex = 1;
  let whereClauses = [];

  if (userId) {
    whereClauses.push(`cl.user_id = $${paramIndex++}`);
    queryValues.push(userId);
  }

  if (minStatusName === 'EXCLUDE_UNCONTACTED' || minStatusName === 'NOT_Available') {
    whereClauses.push(
      `cl.status_id NOT IN (SELECT status_id FROM tb_status WHERE status ILIKE 'Uncontacted' OR status ILIKE 'Belum Dihubungi')`
    );
  }

  if (campaignId) {
    whereClauses.push(`cl.campaign_id = $${paramIndex++}`);
    queryValues.push(campaignId);
  }

  if (search) {
    whereClauses.push(`l.lead_name ILIKE $${paramIndex++}`);
    queryValues.push(`%${search}%`);
  }

  if (minScore !== null && minScore !== undefined) {
    whereClauses.push(`ls.lead_score >= $${paramIndex++}`);
    queryValues.push(minScore);
  }
  if (maxScore !== null && maxScore !== undefined) {
    whereClauses.push(`ls.lead_score <= $${paramIndex++}`);
    queryValues.push(maxScore);
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
  const { search, campaignId, minStatusName, minScore, maxScore, userId } = options;
  let queryText = `
    SELECT COUNT(cl.campaignleads_id)
    FROM tb_campaign_leads cl
    JOIN tb_leads l ON cl.lead_id = l.lead_id
    LEFT JOIN tb_leads_score ls ON cl.lead_id = ls.lead_id
    WHERE 1=1
`;
  const queryValues = [];
  let paramIndex = 1;

  if (userId) {
    queryText += ` AND cl.user_id = $${paramIndex++}`;
    queryValues.push(userId);
  }

  if (minStatusName === 'EXCLUDE_UNCONTACTED' || minStatusName === 'NOT_Available') {
    queryText += `
        AND cl.status_id NOT IN (SELECT status_id FROM tb_status WHERE status ILIKE 'Uncontacted' OR status ILIKE 'Belum Dihubungi')
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

  if (minScore !== null && minScore !== undefined) {
    queryText += ` AND ls.lead_score >= $${paramIndex++}`;
    queryValues.push(minScore);
  }
  if (maxScore !== null && maxScore !== undefined) {
    queryText += ` AND ls.lead_score <= $${paramIndex++}`;
    queryValues.push(maxScore);
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

const findStatusByName = async (statusName) => {
  const { rows } = await db.query('SELECT status_id, status FROM tb_status WHERE status ILIKE $1', [
    statusName,
  ]);
  return rows[0];
};

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
    throw new ApiError(404, 'Lead Campaign not found or not allowed to update');
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

const updateStatusByLeadAndCampaign = async (leadId, campaignId, statusId, userId) => {
  const query = {
    text: `
            UPDATE tb_campaign_leads
            SET
                status_id = $1,
                user_id = $2,
                updated_at = NOW()
            WHERE lead_id = $3 AND campaign_id = $4
            RETURNING *
        `,
    values: [statusId, userId, leadId, campaignId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const deleteById = async (leadCampaignId) => {
  const query = {
    text: 'DELETE FROM tb_campaign_leads WHERE campaignleads_id = $1 RETURNING *',
    values: [leadCampaignId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const findPoutcomeByName = async (poutcomeName) => {
  const { rows } = await db.query(
    'SELECT poutcome_id, poutcome_name FROM tb_poutcome WHERE poutcome_name ILIKE $1',
    [poutcomeName]
  );
  return rows[0];
};

module.exports = {
  findAllBySales,
  countAllBySales,
  findStatusByName,
  updateStatus,
  updateStatusByLeadAndCampaign,
  createStatusHistory,
  deleteById,
  findPoutcomeByName,
};
