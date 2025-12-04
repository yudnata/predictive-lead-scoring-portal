const db = require('../../../config/database');

const create = async (historyData) => {
  const { lead_id, campaign_id, status_id, changed_by } = historyData;
  const query = {
    text: `
      INSERT INTO tb_lead_status_history
        (lead_id, campaign_id, status_id, changed_by, changed_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `,
    values: [lead_id, campaign_id, status_id, changed_by],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const findAll = async (options) => {
  const { role, userId, limit, offset, search, campaignId, startDate, endDate, statusId } = options;

  let queryText = `
    SELECT 
      h.history_id,
      h.changed_at,
      l.lead_name,
      l.lead_id,
      u.full_name AS sales_name,
      c.campaign_name,
      c.campaign_id,
      s.status
    FROM tb_lead_status_history h
    JOIN tb_leads l ON h.lead_id = l.lead_id
    JOIN tb_users u ON h.changed_by = u.user_id
    JOIN tb_campaigns c ON h.campaign_id = c.campaign_id
    JOIN tb_status s ON h.status_id = s.status_id
    WHERE 1=1
  `;
  const queryValues = [];
  let paramIndex = 1;
  let whereClauses = [];

  if (campaignId) {
    whereClauses.push(`h.campaign_id = $${paramIndex++}`);
    queryValues.push(campaignId);
  }

  if (statusId) {
    whereClauses.push(`h.status_id = $${paramIndex++}`);
    queryValues.push(statusId);
  } else {
    whereClauses.push(`h.status_id IN (5, 6)`);
  }

  if (startDate) {
    whereClauses.push(`DATE(h.changed_at) >= $${paramIndex++}`);
    queryValues.push(startDate);
  }
  if (endDate) {
    whereClauses.push(`DATE(h.changed_at) <= $${paramIndex++}`);
    queryValues.push(endDate);
  }

  if (search) {
    whereClauses.push(`(l.lead_name ILIKE $${paramIndex++} OR u.full_name ILIKE $${paramIndex++})`);
    queryValues.push(`%${search}%`, `%${search}%`);
  }

  if (whereClauses.length > 0) {
    queryText += ' AND ' + whereClauses.join(' AND ');
  }

  queryText += ` ORDER BY h.changed_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

const countAll = async (options) => {
  const { role, userId, search, campaignId, startDate, endDate, statusId } = options;

  let queryText = `
    SELECT COUNT(h.history_id)
    FROM tb_lead_status_history h
    JOIN tb_leads l ON h.lead_id = l.lead_id
    JOIN tb_users u ON h.changed_by = u.user_id
    WHERE 1=1
  `;
  const queryValues = [];
  let paramIndex = 1;
  let whereClauses = [];

  if (campaignId) {
    whereClauses.push(`h.campaign_id = $${paramIndex++}`);
    queryValues.push(campaignId);
  }

  if (statusId) {
    whereClauses.push(`h.status_id = $${paramIndex++}`);
    queryValues.push(statusId);
  } else {
    whereClauses.push(`h.status_id IN (5, 6)`);
  }

  if (startDate) {
    whereClauses.push(`DATE(h.changed_at) >= $${paramIndex++}`);
    queryValues.push(startDate);
  }
  if (endDate) {
    whereClauses.push(`DATE(h.changed_at) <= $${paramIndex++}`);
    queryValues.push(endDate);
  }

  if (search) {
    whereClauses.push(`(l.lead_name ILIKE $${paramIndex++} OR u.full_name ILIKE $${paramIndex++})`);
    queryValues.push(`%${search}%`, `%${search}%`);
  }

  if (whereClauses.length > 0) {
    queryText += ' AND ' + whereClauses.join(' AND ');
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

const findById = async (historyId) => {
  const query = {
    text: 'SELECT * FROM tb_lead_status_history WHERE history_id = $1',
    values: [historyId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const deleteById = async (historyId) => {
  const query = {
    text: 'DELETE FROM tb_lead_status_history WHERE history_id = $1 RETURNING *',
    values: [historyId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const deleteFinalStatus = async (leadId, campaignId, statusId) => {
  const query = {
    text: `
      DELETE FROM tb_lead_status_history
      WHERE lead_id = $1 AND campaign_id = $2 AND status_id = $3
    `,
    values: [leadId, campaignId, statusId],
  };
};

const deleteByCampaign = async (campaignId) => {
  const { rowCount } = await db.query('DELETE FROM tb_lead_status_history WHERE campaign_id = $1', [
    campaignId,
  ]);
  return rowCount;
};

module.exports = {
  create,
  findAll,
  countAll,
  deleteFinalStatus,
  deleteById,
  findById,
  deleteByCampaign,
};
