const campaignModel = require('../models/campaign.model');
const assignmentService = require('./campaignAssignment.service');
const campaignLeadModel = require('../models/campaignLead.model');
const historyModel = require('../models/history.model');
const ApiError = require('../utils/apiError');

const createCampaign = async (campaignBody) => {
  if (!campaignBody.campaign_name) {
    throw new ApiError(400, 'Campaign name is required');
  }

  const newCampaign = await campaignModel.create(campaignBody);
  const campaignId = newCampaign.campaign_id;

  if (!Array.isArray(campaignBody.assigned_sales) || campaignBody.assigned_sales.length === 0) {
    return newCampaign;
  }

  const sample = campaignBody.assigned_sales[0];
  let userIds;

  if (typeof sample === 'object' && sample !== null && 'user_id' in sample) {
    userIds = campaignBody.assigned_sales.map((s) => s.user_id);
  } else {
    userIds = campaignBody.assigned_sales.map((s) => parseInt(s));
  }

  const validUserIds = userIds.filter((id) => id);

  for (const uid of validUserIds) {
    await assignmentService.assignSalesToCampaign(uid, campaignId);
  }

  return newCampaign;
};

const queryCampaigns = async (queryOptions, userId = null) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';

  const isActive = queryOptions.is_active || queryOptions.isActive;
  const startDate = queryOptions.start_date || queryOptions.startDate;
  const endDate = queryOptions.end_date || queryOptions.endDate;

  const options = { limit, offset, search, userId, isActive, startDate, endDate };

  const campaigns = await campaignModel.findAll(options);
  const totalCampaigns = await campaignModel.countAll(options);
  const totalPages = Math.ceil(totalCampaigns / limit);

  return {
    data: campaigns,
    meta: {
      total: totalCampaigns,
      page,
      limit,
      totalPages,
    },
  };
};

const getCampaignById = async (campaignId) => {
  const campaign = await campaignModel.findById(campaignId);
  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }
  return campaign;
};

const updateCampaignById = async (campaignId, updateBody) => {
  const existingCampaign = await getCampaignById(campaignId);

  const finalUpdateData = {
    ...existingCampaign,
    ...updateBody,
  };

  if ('campaign_is_active' in updateBody) {
    const value = updateBody.campaign_is_active;
    finalUpdateData.campaign_is_active =
      typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);
  }

  const updatedCampaign = await campaignModel.update(campaignId, finalUpdateData);

  if (Array.isArray(updateBody.assigned_sales)) {
    const sampleItem = updateBody.assigned_sales[0];
    let userIds;

    if (typeof sampleItem === 'object' && sampleItem !== null && 'user_id' in sampleItem) {
      userIds = updateBody.assigned_sales.map((s) => s.user_id);
    } else if (
      typeof sampleItem === 'number' ||
      (typeof sampleItem === 'string' && !isNaN(parseInt(sampleItem)))
    ) {
      userIds = updateBody.assigned_sales.map(String);
    } else {
      userIds = updateBody.assigned_sales;
    }

    const validUserIds = userIds.filter((id) => id != null && id !== '');

    await assignmentService.resetAssignments(campaignId, validUserIds);
  }

  return updatedCampaign;
};

const deleteCampaignById = async (campaignId) => {
  await getCampaignById(campaignId);
  await assignmentService.resetAssignments(campaignId, []);
  await campaignLeadModel.deleteByCampaign(campaignId);
  await historyModel.deleteByCampaign(campaignId);
  await campaignModel.deleteById(campaignId);
};

const getCampaignOptions = async () => {
  return await campaignModel.findActiveOptions();
};

module.exports = {
  createCampaign,
  queryCampaigns,
  getCampaignById,
  updateCampaignById,
  deleteCampaignById,
  getCampaignOptions,
};
