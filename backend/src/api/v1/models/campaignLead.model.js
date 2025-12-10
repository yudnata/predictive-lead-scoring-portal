const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

const findById = async (campaignLeadId) => {
  const { rows } = await db.query('SELECT * FROM tb_campaign_leads WHERE campaignleads_id = $1', [
    campaignLeadId,
  ]);
  return rows[0];
};

const findByLeadAndCampaign = async (leadId, campaignId) => {
  const { rows } = await db.query(
    'SELECT * FROM tb_campaign_leads WHERE lead_id = $1 AND campaign_id = $2',
    [leadId, campaignId]
  );
  return rows[0];
};

const create = async (assignData) => {
  const { lead_id, campaign_id, user_id, status_id } = assignData;
  const query = {
    text: `
      INSERT INTO tb_campaign_leads
        (lead_id, campaign_id, user_id, status_id, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `,
    values: [lead_id, campaign_id, user_id, status_id],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const updateStatus = async (campaignLeadId, statusId) => {
  const query = {
    text: `
      UPDATE tb_campaign_leads
      SET status_id = $1, updated_at = NOW()
      WHERE campaignleads_id = $2
      RETURNING *
    `,
    values: [statusId, campaignLeadId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const deleteById = async (campaignLeadId) => {
  const { rowCount } = await db.query('DELETE FROM tb_campaign_leads WHERE campaignleads_id = $1', [
    campaignLeadId,
  ]);
  return rowCount > 0;
};

const deleteByCampaign = async (campaignId) => {
  const { rowCount } = await db.query('DELETE FROM tb_campaign_leads WHERE campaign_id = $1', [
    campaignId,
  ]);
  return rowCount;
};

const findAllForSalesUser = async (options) => {
  const { userId, limit, offset, search, campaignId } = options;

  let queryText = `
    SELECT
      cl.campaignleads_id,
      cl.updated_at,
      l.lead_id,
      l.lead_name,
      ls.lead_score,
      c.campaign_name,
      s.status,
      cl.status_id,
      l.lead_phone_number,
      l.lead_email
    FROM tb_campaign_leads cl
    JOIN tb_leads l ON cl.lead_id = l.lead_id
    JOIN tb_campaigns c ON cl.campaign_id = c.campaign_id
    JOIN tb_status s ON cl.status_id = s.status_id
    LEFT JOIN tb_leads_score ls ON l.lead_id = ls.lead_id
    WHERE cl.user_id = $1
    -- Removed restrictive status filter to show all assigned leads
  `;
  const queryValues = [userId];
  let paramIndex = 2;

  if (campaignId) {
    queryText += ` AND cl.campaign_id = $${paramIndex++}`;
    queryValues.push(campaignId);
  }

  if (search) {
    queryText += ` AND (l.lead_name ILIKE $${paramIndex++} OR l.lead_email ILIKE $${paramIndex++})`;
    queryValues.push(`%${search}%`, `%${search}%`);
  }

  queryText += ` ORDER BY cl.updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

const countAllForSalesUser = async (options) => {
  const { userId, search, campaignId } = options;

  let queryText = `
    SELECT COUNT(cl.campaignleads_id)
    FROM tb_campaign_leads cl
    JOIN tb_leads l ON cl.lead_id = l.lead_id
    WHERE cl.user_id = $1
    -- Removed restrictive status filter
  `;
  const queryValues = [userId];
  let paramIndex = 2;

  if (campaignId) {
    queryText += ` AND cl.campaign_id = $${paramIndex++}`;
    queryValues.push(campaignId);
  }

  if (search) {
    queryText += ` AND (l.lead_name ILIKE $${paramIndex++} OR l.lead_email ILIKE $${paramIndex++})`;
    queryValues.push(`%${search}%`, `%${search}%`);
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

module.exports = {
  findById,
  findByLeadAndCampaign,
  create,
  updateStatus,
  findAllForSalesUser,
  countAllForSalesUser,
  deleteById,
  deleteByCampaign,
};
