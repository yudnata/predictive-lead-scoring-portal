const campaignLeadModel = require('../models/campaignLead.model');
const historyModel = require('../models/history.model.js');
const leadModel = require('../models/lead.model');
const campaignModel = require('../models/campaign.model');
const ApiError = require('../utils/apiError');

const assignLeadToCampaign = async (userId, assignBody) => {
  const { lead_id, campaign_id, status_id } = assignBody;
  if (!lead_id || !campaign_id || !status_id) {
    throw new ApiError(400, 'lead_id, campaign_id, and status_id are required');
  }

  if (status_id === 5 || status_id === 6) {
    throw new ApiError(400, 'Initial status cannot be Deal or Reject');
  }

  const lead = await leadModel.findFullLeadById(lead_id);
  if (!lead) throw new ApiError(404, 'Lead not found');

  const campaign = await campaignModel.findById(campaign_id);
  if (!campaign) throw new ApiError(404, 'Campaign not found');

  const existingLink = await campaignLeadModel.findByLeadAndCampaign(lead_id, campaign_id);
  if (existingLink) {
    throw new ApiError(400, `Lead is already assigned to campaign "${campaign.campaign_name}"`);
  }

  const assignData = { lead_id, campaign_id, user_id: userId, status_id };
  const newCampaignLead = await campaignLeadModel.create(assignData);

  const currentLead = await leadModel.findFullLeadById(lead_id);
  await leadModel.update(
    lead_id,
    {},
    {
      campaign_count: (currentLead.campaign_count || 0) + 1,
    }
  );

  return newCampaignLead;
};

const updateLeadStatus = async (campaignLeadId, userId, statusId) => {
  if (!statusId) throw new ApiError(400, 'status_id is required');
  statusId = parseInt(statusId, 10);
  console.log(`[DEBUG] updateLeadStatus: campaignLeadId=${campaignLeadId}, statusId=${statusId}`);

  const campaignLead = await campaignLeadModel.findById(campaignLeadId);
  if (!campaignLead) {
    throw new ApiError(404, 'Campaign-Lead link not found');
  }

  if (campaignLead.user_id !== userId) {
    throw new ApiError(403, 'Forbidden: You cannot change status of leads owned by other sales');
  }

  if (campaignLead.status_id === statusId) {
    throw new ApiError(400, 'Status is already the same as current status');
  }

  const updatedCampaignLead = await campaignLeadModel.updateStatus(campaignLeadId, statusId);
  if (statusId === 4) {
    console.log('[DEBUG] Status is 4 (Contacted). Updating lead details...');
    const now = new Date();
    const day = now.getDate();
    const monthIndex = now.getMonth();
    const monthId = monthIndex + 1;
    const currentLead = await leadModel.findFullLeadById(campaignLead.lead_id);
    console.log('[DEBUG] Current Lead:', currentLead ? currentLead.lead_id : 'Not Found');

    const updateData = {
      last_contact_day: day,
      month_id: monthId,
      pdays: 0,
      prev_contact_count: (currentLead.prev_contact_count || 0) + 1,
    };
    console.log('[DEBUG] Update Data:', updateData);

    await leadModel.update(campaignLead.lead_id, {}, updateData);
    console.log('[DEBUG] Lead details updated.');
  }

  if (statusId === 5) {
    await leadModel.update(campaignLead.lead_id, {}, { poutcome_id: 3 });
  }

  if (statusId === 6) {
    await leadModel.update(campaignLead.lead_id, {}, { poutcome_id: 1 });
  }

  if (statusId === 5 || statusId === 6) {
    const historyData = {
      lead_id: updatedCampaignLead.lead_id,
      campaign_id: updatedCampaignLead.campaign_id,
      status_id: updatedCampaignLead.status_id,
      changed_by: userId,
    };
    await historyModel.create(historyData);
  }

  return updatedCampaignLead;
};

const getSalesLeadTracker = async (userId, queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';
  const campaignId = queryOptions.campaign_id || null;

  const options = { userId, limit, offset, search, campaignId };

  const leads = await campaignLeadModel.findAllForSalesUser(options);
  const totalLeads = await campaignLeadModel.countAllForSalesUser(options);
  const totalPages = Math.ceil(totalLeads / limit);

  return {
    data: leads,
    meta: {
      total: totalLeads,
      page,
      limit,
      totalPages,
    },
  };
};

const adminUpdateLeadStatus = async (campaignLeadId, newStatusId, adminUserId) => {
  if (!newStatusId) throw new ApiError(400, 'New status_id is required');

  const campaignLead = await campaignLeadModel.findById(campaignLeadId);
  if (!campaignLead) {
    throw new ApiError(404, 'Campaign-Lead link not found');
  }

  const oldStatusId = campaignLead.status_id;
  if (oldStatusId === newStatusId) {
    throw new ApiError(400, 'Status is already the same as current status');
  }

  const updatedCampaignLead = await campaignLeadModel.updateStatus(campaignLeadId, newStatusId);
  const { lead_id, campaign_id } = updatedCampaignLead;

  const wasFinal = oldStatusId === 5 || oldStatusId === 6;
  const isNowFinal = newStatusId === 5 || newStatusId === 6;

  if (wasFinal && !isNowFinal) {
    await historyModel.deleteFinalStatus(lead_id, campaign_id, oldStatusId);
  } else if (!wasFinal && isNowFinal) {
    await historyModel.create({
      lead_id,
      campaign_id,
      status_id: newStatusId,
      changed_by: adminUserId,
    });
  } else if (wasFinal && isNowFinal) {
    await historyModel.deleteFinalStatus(lead_id, campaign_id, oldStatusId);
    await historyModel.create({
      lead_id,
      campaign_id,
      status_id: newStatusId,
      changed_by: adminUserId,
    });
  }

  return updatedCampaignLead;
};

const deleteCampaignLead = async (campaignLeadId, userId) => {
  const campaignLead = await campaignLeadModel.findById(campaignLeadId);
  if (!campaignLead) {
    throw new ApiError(404, 'Campaign-Lead link not found');
  }

  if (campaignLead.user_id !== userId) {
    throw new ApiError(403, 'Forbidden: You cannot delete leads owned by other sales');
  }

  await campaignLeadModel.deleteById(campaignLeadId);
  return true;
};

module.exports = {
  assignLeadToCampaign,
  updateLeadStatus,
  getSalesLeadTracker,
  adminUpdateLeadStatus,
  deleteCampaignLead,
};
