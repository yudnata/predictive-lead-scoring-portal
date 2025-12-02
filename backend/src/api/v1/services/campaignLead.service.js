const campaignLeadModel = require('../models/campaignLead.model');
const historyModel = require('../models/history.model.js');
const leadModel = require('../models/lead.model');
const campaignModel = require('../models/campaign.model');
const ApiError = require('../utils/apiError');

const assignLeadToCampaign = async (userId, assignBody) => {
  const { lead_id, campaign_id, status_id } = assignBody;
  if (!lead_id || !campaign_id || !status_id) {
    throw new ApiError(400, 'lead_id, campaign_id, dan status_id harus diisi');
  }

  if (status_id === 5 || status_id === 6) {
    throw new ApiError(400, 'Status awal tidak boleh Deal atau Reject');
  }

  const lead = await leadModel.findFullLeadById(lead_id);
  if (!lead) throw new ApiError(404, 'Lead tidak ditemukan');

  const campaign = await campaignModel.findById(campaign_id);
  if (!campaign) throw new ApiError(404, 'Campaign tidak ditemukan');

  const existingLink = await campaignLeadModel.findByLeadAndCampaign(lead_id, campaign_id);
  if (existingLink) {
    throw new ApiError(400, 'Lead ini sudah ditautkan ke campaign tersebut');
  }

  const assignData = { lead_id, campaign_id, user_id: userId, status_id };
  const newCampaignLead = await campaignLeadModel.create(assignData);

  return newCampaignLead;
};

const updateLeadStatus = async (campaignLeadId, userId, statusId) => {
  if (!statusId) throw new ApiError(400, 'status_id harus diisi');

  const campaignLead = await campaignLeadModel.findById(campaignLeadId);
  if (!campaignLead) {
    throw new ApiError(404, 'Tautan Campaign-Lead tidak ditemukan');
  }

  if (campaignLead.user_id !== userId) {
    throw new ApiError(403, 'Forbidden: Anda tidak bisa mengubah status lead milik sales lain');
  }

  if (campaignLead.status_id === statusId) {
    throw new ApiError(400, 'Status sudah sama dengan status saat ini');
  }

  const updatedCampaignLead = await campaignLeadModel.updateStatus(campaignLeadId, statusId);

  if (statusId === 3 || statusId === 4) {
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
  if (!newStatusId) throw new ApiError(400, 'status_id baru harus diisi');

  const campaignLead = await campaignLeadModel.findById(campaignLeadId);
  if (!campaignLead) {
    throw new ApiError(404, 'Tautan Campaign-Lead tidak ditemukan');
  }

  const oldStatusId = campaignLead.status_id;
  if (oldStatusId === newStatusId) {
    throw new ApiError(400, 'Status sudah sama dengan status saat ini');
  }

  const updatedCampaignLead = await campaignLeadModel.updateStatus(campaignLeadId, newStatusId);
  const { lead_id, campaign_id } = updatedCampaignLead;

  const wasFinal = oldStatusId === 3 || oldStatusId === 4;
  const isNowFinal = newStatusId === 3 || newStatusId === 4;

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
    throw new ApiError(404, 'Tautan Campaign-Lead tidak ditemukan');
  }

  if (campaignLead.user_id !== userId) {
    throw new ApiError(403, 'Forbidden: Anda tidak bisa menghapus lead milik sales lain');
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
