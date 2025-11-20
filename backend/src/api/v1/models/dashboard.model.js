const db = require('../../../config/database');

const getStats = async () => {
  const query = {
    text: `
      SELECT
        -- 1. Total Leads
        (SELECT COUNT(*) FROM tb_leads) AS "totalLeads",
        
        -- 2. Average Leads Score
        (SELECT AVG(lead_score) FROM tb_leads_score WHERE lead_score > 0) AS "averageLeadsScore",
        
        -- 3. Total Active Campaigns
        (SELECT COUNT(*) FROM tb_campaigns WHERE campaign_is_active = true) AS "activeCampaigns",
        
        -- 4. Conversion Rate (Deal / (Deal + Reject))
        (
          SELECT 
            (COUNT(CASE WHEN status_id = 3 THEN 1 END) * 1.0) / 
            (NULLIF(COUNT(CASE WHEN status_id IN (3, 4) THEN 1 END), 0))
          FROM tb_lead_status_history
        ) AS "conversionRate"
    `,
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const getScoreDistribution = async () => {
  const query = {
    text: `
      SELECT
        COUNT(CASE WHEN lead_score >= 0.75 THEN 1 END) AS "skorTinggi",
        COUNT(CASE WHEN lead_score >= 0.50 AND lead_score < 0.75 THEN 1 END) AS "skorSedang",
        COUNT(CASE WHEN lead_score < 0.50 THEN 1 END) AS "skorRendah"
      FROM tb_leads_score
    `,
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const getTopLeads = async () => {
  const query = {
    text: `
      SELECT l.lead_name, ls.lead_score
      FROM tb_leads l
      JOIN tb_leads_score ls ON l.lead_id = ls.lead_id
      ORDER BY ls.lead_score DESC
      LIMIT 5
    `,
  };
  const { rows } = await db.query(query);
  return rows;
};

const getTopCampaigns = async () => {
  const query = {
    text: `
      SELECT
        c.campaign_name,
        (
          (COUNT(CASE WHEN h.status_id = 3 THEN 1 END) * 1.0) / 
          (NULLIF(COUNT(CASE WHEN h.status_id IN (3, 4) THEN 1 END), 0))
        ) AS "conversionRate"
      FROM tb_lead_status_history h
      JOIN tb_campaigns c ON h.campaign_id = c.campaign_id
      GROUP BY c.campaign_name
      ORDER BY "conversionRate" DESC
      LIMIT 3
    `,
  };
  const { rows } = await db.query(query);
  return rows;
};

const getConversionRateTrend = async () => {
  const query = {
    text: `
      SELECT
        -- 1. Kelompokkan berdasarkan hari
        date_trunc('day', changed_at) AS "date",
        -- 2. Hitung rasio Deal / (Deal + Reject) pada hari itu
        (
          (COUNT(CASE WHEN status_id = 3 THEN 1 END) * 1.0) / 
          (NULLIF(COUNT(CASE WHEN status_id IN (3, 4) THEN 1 END), 0))
        ) AS "conversionRate"
      FROM tb_lead_status_history
      WHERE 
        -- 3. Hanya ambil data 30 hari terakhir
        changed_at >= NOW() - INTERVAL '30 days'
        AND status_id IN (3, 4) -- Hanya hitung perubahan status final
      GROUP BY "date"
      ORDER BY "date" ASC; -- Wajib ASC untuk line chart
    `,
  };
  const { rows } = await db.query(query);
  return rows;
};

module.exports = {
  getStats,
  getScoreDistribution,
  getTopLeads,
  getTopCampaigns,
  getConversionRateTrend,
};