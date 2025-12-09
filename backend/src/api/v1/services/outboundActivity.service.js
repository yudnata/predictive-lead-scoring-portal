const OutboundActivity = require('../models/outboundActivity.model');
const LeadsTrackerService = require('./leadsTracker.service');
const LeadModel = require('../models/lead.model');
const db = require('../../../config/database');

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
