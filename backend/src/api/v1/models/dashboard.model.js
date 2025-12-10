const db = require('../../../config/database');

const getStats = async () => {
  const query = {
    text: `
      WITH stats_counts AS (
        SELECT
          (SELECT COUNT(*) FROM tb_campaign_leads) AS "active_count",
          (SELECT COUNT(*) FROM tb_lead_status_history WHERE status_id = 5) AS "deal_count",
          (SELECT COUNT(*) FROM tb_lead_status_history WHERE status_id = 6) AS "reject_count"
      )
      SELECT
        (SELECT COUNT(lead_id) FROM tb_leads) AS "totalLeads",
        (SELECT COALESCE(ROUND(AVG(lead_score) * 100, 2), 0) FROM tb_leads_score) AS "averageLeadsScore",
        (
          SELECT
            CASE WHEN (active_count + deal_count + reject_count) = 0 THEN 0
            ELSE (
              (deal_count::float) /
              (active_count + deal_count + reject_count)::float
            ) * 100
            END
          FROM stats_counts
        ) AS "conversionRate",

        (
          SELECT COUNT(campaign_id)
          FROM tb_campaigns
          WHERE campaign_is_active = true
        ) AS "activeCampaigns",

        (
          SELECT
            CASE WHEN (active_count + deal_count + reject_count) = 0 THEN 0
            ELSE (
              (reject_count::float) /
              (active_count + deal_count + reject_count)::float
            ) * 100
            END
          FROM stats_counts
        ) AS "rejectRate"
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
      SELECT l.lead_name, ROUND(ls.lead_score * 100, 2) as score
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
      WITH campaign_stats AS (
        SELECT
          c.campaign_name,
          COALESCE(COUNT(DISTINCT cl.lead_id), 0) AS active_count,
          COALESCE((
            SELECT COUNT(*)
            FROM tb_lead_status_history lsh
            WHERE lsh.campaign_id = c.campaign_id AND lsh.status_id = 5
          ), 0) AS deal_count,
          COALESCE((
            SELECT COUNT(*)
            FROM tb_lead_status_history lsh
            WHERE lsh.campaign_id = c.campaign_id AND lsh.status_id = 6
          ), 0) AS reject_count
        FROM tb_campaigns c
        LEFT JOIN tb_campaign_leads cl ON c.campaign_id = cl.campaign_id
        GROUP BY c.campaign_id, c.campaign_name
      )
      SELECT
        campaign_name as name,
        CASE WHEN (active_count + deal_count + reject_count) = 0 THEN 0
        ELSE (
          (deal_count::float) /
          (active_count + deal_count + reject_count)::float
        ) * 100
        END AS rate
      FROM campaign_stats
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
        CASE WHEN (COUNT(CASE WHEN status_id = 5 THEN 1 END) + COUNT(CASE WHEN status_id = 6 THEN 1 END)) = 0 THEN 0
        ELSE (
          (COUNT(CASE WHEN status_id = 5 THEN 1 END)::float) /
          ((COUNT(CASE WHEN status_id = 5 THEN 1 END) + COUNT(CASE WHEN status_id = 6 THEN 1 END))::float)
        ) * 100
        END AS "rate",
        CASE WHEN (COUNT(CASE WHEN status_id = 5 THEN 1 END) + COUNT(CASE WHEN status_id = 6 THEN 1 END)) = 0 THEN 0
        ELSE (
          (COUNT(CASE WHEN status_id = 6 THEN 1 END)::float) /
          ((COUNT(CASE WHEN status_id = 5 THEN 1 END) + COUNT(CASE WHEN status_id = 6 THEN 1 END))::float)
        ) * 100
        END AS "rejectRate"
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
