const db = require('../../../config/database');

const getStats = async () => {
  const query = {
    text: `
      SELECT
        (SELECT COUNT(lead_id) FROM tb_leads) AS "totalLeads",
        (SELECT COALESCE(AVG(lead_score) * 100, 0)::int FROM tb_leads_score) AS "averageLeadsScore",
        (
          SELECT
            CASE WHEN COUNT(*) = 0 THEN 0
            ELSE (
              (COUNT(CASE WHEN status_id = 3 THEN 1 END)::float) /
              (NULLIF(COUNT(CASE WHEN status_id != 1 THEN 1 END), 0)::float)
            ) * 100
            END
          FROM tb_campaign_leads
        ) AS "conversionRate",

        (
          SELECT COUNT(campaign_id)
          FROM tb_campaigns
          WHERE campaign_is_active = true
        ) AS "activeCampaigns",

        (
          WITH leads_contact_again AS (
            SELECT DISTINCT lead_id FROM tb_lead_status_history WHERE status_id = 5
          )
          SELECT
            CASE WHEN COUNT(lca.lead_id) = 0 THEN 0
            ELSE (
              (COUNT(CASE WHEN cl.status_id = 4 THEN 1 END)::float) /
              (COUNT(lca.lead_id)::float)
            ) * 100
            END
          FROM leads_contact_again lca
          JOIN tb_campaign_leads cl ON lca.lead_id = cl.lead_id
        ) AS "reboundRate"
    `,
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const getScoreDistribution = async () => {
  const query = {
    text: `
      SELECT
        COUNT(CASE WHEN lead_score * 100 > 70 THEN 1 END) AS "Skor Tinggi",
        COUNT(CASE WHEN lead_score * 100 >= 20 AND lead_score * 100 <= 70 THEN 1 END) AS "Skor Sedang",
        COUNT(CASE WHEN lead_score * 100 < 20 THEN 1 END) AS "Skor Rendah"
      FROM tb_leads_score
    `,
  };
  const { rows } = await db.query(query);

  const rawResult = [
    { label: 'Skor Tinggi', value: parseInt(rows[0]['Skor Tinggi'] || 0), color: '#4ade80' },
    { label: 'Skor Sedang', value: parseInt(rows[0]['Skor Sedang'] || 0), color: '#facc15' },
    { label: 'Skor Rendah', value: parseInt(rows[0]['Skor Rendah'] || 0), color: '#f87171' },
  ];

  const total = rawResult.reduce((acc, curr) => acc + curr.value, 0);

  return rawResult.map((r) => ({
    ...r,
    percentage: total === 0 ? '0%' : Math.round((r.value / total) * 100) + '%',
  }));
};

const getTopLeads = async () => {
  const query = {
    text: `
      SELECT l.lead_name, (ls.lead_score * 100)::int as score
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
        c.campaign_name as name,
        CASE WHEN COUNT(cl.lead_id) = 0 THEN 0
        ELSE (
          (COUNT(CASE WHEN cl.status_id = 3 THEN 1 END)::float) /
          (COUNT(cl.lead_id)::float)
        ) * 100
        END AS rate
      FROM tb_campaigns c
      JOIN tb_campaign_leads cl ON c.campaign_id = cl.campaign_id
      GROUP BY c.campaign_name
      ORDER BY rate DESC
      LIMIT 3
    `,
  };
  const { rows } = await db.query(query);
  return rows.map((r) => ({
    ...r,
    rate: Math.round(r.rate) + '%',
  }));
};

const getConversionRateTrend = async () => {
  const query = {
    text: `
      SELECT
        TO_CHAR(changed_at, 'YYYY-MM-DD') AS "date",
        CASE WHEN COUNT(*) = 0 THEN 0
        ELSE (
          (COUNT(CASE WHEN status_id = 3 THEN 1 END)::float) /
          (COUNT(*)::float)
        ) * 100
        END AS "rate"
      FROM tb_lead_status_history
      WHERE changed_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1 ASC
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
