const db = require('../../../config/database');

const create = async (data) => {
  const { lead_id, lead_campaign_id, user_id, activity_type, outcome, notes, created_at } = data;

  const query = {
    text: `
      INSERT INTO tb_outbound_activities (lead_id, lead_campaign_id, user_id, activity_type, outcome, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    values: [
      lead_id,
      lead_campaign_id,
      user_id,
      activity_type,
      outcome,
      notes || '',
      created_at || new Date(),
    ],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

const findByLeadId = async (leadId, leadCampaignId = null) => {
  let queryText = `
      SELECT oa.*, u.full_name as sales_name
      FROM tb_outbound_activities oa
      JOIN tb_users u ON oa.user_id = u.user_id
      WHERE oa.lead_id = $1
    `;

  const values = [leadId];

  if (leadCampaignId) {
    queryText += ` AND oa.lead_campaign_id = $2`;
    values.push(leadCampaignId);
  }

  queryText += ` ORDER BY oa.created_at DESC`;

  const query = {
    text: queryText,
    values: values,
  };
  const { rows } = await db.query(query);
  return rows;
};

module.exports = {
  create,
  findByLeadId,
};
