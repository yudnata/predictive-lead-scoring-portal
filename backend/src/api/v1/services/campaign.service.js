const campaignModel = require('../models/campaign.model');
const ApiError = require('../utils/apiError');

const createCampaign = async (campaignBody) => {
  if (!campaignBody.campaign_name) {
    throw new ApiError(400, 'Nama campaign harus diisi');
  }
  return campaignModel.create(campaignBody);
};

const queryCampaigns = async (queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';

  const options = { limit, offset, search };

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
    throw new ApiError(404, 'Campaign tidak ditemukan');
  }
  return campaign;
};

const updateCampaignById = async (campaignId, updateBody) => {
  await getCampaignById(campaignId);

  if (!updateBody.campaign_name) {
    throw new ApiError(400, 'Nama campaign harus diisi');
  }

  return campaignModel.update(campaignId, updateBody);
};

const deleteCampaignById = async (campaignId) => {
  await getCampaignById(campaignId);
  await campaignModel.deleteById(campaignId);
};

module.exports = {
  createCampaign,
  queryCampaigns,
  getCampaignById,
  updateCampaignById,
  deleteCampaignById,
};