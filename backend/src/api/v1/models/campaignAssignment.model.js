const db = require('../../../config/database');

exports.create = async (userId, campaignId) => {
  const query = {
    text: `
      INSERT INTO tb_campaign_assignments (user_id, campaign_id, assigned_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `,
    values: [userId, campaignId],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

exports.findSalesByCampaign = async (campaignId) => {
  const query = {
    text: `
      SELECT
        a.assignment_id,
        u.user_id,
        u.user_name,
        u.user_email
      FROM tb_campaign_assignments a
      JOIN tb_users u ON u.user_id = a.user_id
      WHERE a.campaign_id = $1
    `,
    values: [campaignId],
  };

  const { rows } = await db.query(query);
  return rows;
};

exports.findCampaignsBySales = async (userId) => {
  const query = {
    text: `
      SELECT
        c.campaign_id,
        c.campaign_name,
        c.campaign_start_date,
        c.campaign_end_date,
        c.campaign_desc,
        c.campaign_is_active
      FROM tb_campaign_assignments a
      JOIN tb_campaigns c ON c.campaign_id = a.campaign_id
      WHERE a.user_id = $1
        AND c.campaign_is_active = TRUE
      ORDER BY c.created_at DESC
    `,
    values: [userId],
  };

  const { rows } = await db.query(query);
  return rows;
};

exports.deleteByCampaign = async (campaignId) => {
  const query = {
    text: `DELETE FROM tb_campaign_assignments WHERE campaign_id = $1`,
    values: [campaignId],
  };
  await db.query(query);
};
