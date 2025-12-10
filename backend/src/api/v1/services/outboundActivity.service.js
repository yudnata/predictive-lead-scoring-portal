const OutboundActivity = require('../models/outboundActivity.model');
const LeadsTrackerService = require('./leadsTracker.service');
const LeadModel = require('../models/lead.model');
const db = require('../../../config/database');
const axios = require('axios');

const recalculateLeadScore = async (leadId) => {
  const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  try {
    const leadQuery = `
      SELECT 
        l.lead_id, l.lead_age,
        j.job_name, m.marital_status, e.education_level,
        d.lead_default, d.lead_balance, d.lead_housing_loan, d.lead_loan,
        d.last_contact_day, d.month_id, d.last_contact_duration_sec,
        d.campaign_count, d.pdays, d.prev_contact_count,
        po.poutcome_name, cm.contact_method_name
      FROM tb_leads l
      LEFT JOIN tb_job j ON l.job_id = j.job_id
      LEFT JOIN tb_marital m ON l.marital_id = m.marital_id
      LEFT JOIN tb_education e ON l.education_id = e.education_id
      LEFT JOIN tb_leads_detail d ON l.lead_id = d.lead_id
      LEFT JOIN tb_poutcome po ON d.poutcome_id = po.poutcome_id
      LEFT JOIN tb_contact_method cm ON d.contactmethod_id = cm.contactmethod_id
      WHERE l.lead_id = $1
    `;

    const { rows } = await db.query(leadQuery, [leadId]);
    if (rows.length === 0) return;

    const lead = rows[0];

    const predictionData = {
      age: lead.lead_age || 30,
      balance: lead.lead_balance || 0,
      day: lead.last_contact_day || 1,
      duration: lead.last_contact_duration_sec || 0,
      campaign: lead.campaign_count || 0,
      pdays: lead.pdays !== undefined && lead.pdays !== null ? lead.pdays : 999,
      previous: lead.prev_contact_count || 0,
      job: lead.job_name?.toLowerCase() || 'unknown',
      marital: lead.marital_status?.toLowerCase() || 'unknown',
      education: lead.education_level?.toLowerCase() || 'unknown',
      default: lead.lead_default ? 'yes' : 'no',
      housing: lead.lead_housing_loan ? 'yes' : 'no',
      loan: lead.lead_loan ? 'yes' : 'no',
      contact: lead.contact_method_name?.toLowerCase() || 'unknown',
      month: monthNames[(lead.month_id || 1) - 1] || 'jan',
      poutcome: lead.poutcome_name?.toLowerCase() || 'unknown',
    };

    const mlResponse = await axios.post(`${ML_API_URL}/predict_single`, predictionData, {
      timeout: 10000,
    });

    if (mlResponse.data && mlResponse.data.prediction !== undefined) {
      const newScore = parseFloat(mlResponse.data.prediction);
      await db.query(
        `UPDATE tb_leads_score SET lead_score = $1, predicted_at = NOW() WHERE lead_id = $2`,
        [newScore, leadId]
      );
      console.log(`[Finalize] Score updated for lead ${leadId}: ${(newScore * 100).toFixed(1)}%`);
    }
  } catch (err) {
    console.error(`[Finalize] Failed to recalculate score for lead ${leadId}:`, err.message);
  }
};

const logActivity = async (activityData) => {
  try {
    const activity = await OutboundActivity.create(activityData);
    if (activityData.duration > 0) {
      await db.query(
        `
         UPDATE tb_leads_detail 
         SET last_contact_duration_sec = COALESCE(last_contact_duration_sec, 0) + $1
         WHERE lead_id = $2
       `,
        [activityData.duration, activityData.lead_id]
      );
    }

    const statusMap = {
      Accepted: 5,
      Rejected: 6,
      'Hubungi Lagi': 4,
      'Sedang Dihubungi': 4,
    };

    const newStatusId = statusMap[activityData.outcome] || statusMap[activityData.status];

    if ((newStatusId === 5 || newStatusId === 6) && activityData.lead_campaign_id) {
      await LeadsTrackerService.updateLeadStatus(
        activityData.lead_campaign_id,
        newStatusId,
        activityData.user_id
      );

      recalculateLeadScore(activityData.lead_id);
    }

    return activity;
  } catch (err) {
    throw err;
  }
};

const getHistory = async (leadId, campaignId = null) => {
  return await OutboundActivity.findByLeadId(leadId, campaignId);
};

module.exports = {
  logActivity,
  getHistory,
};
