const campaignModel = require('../models/campaign.model');
const ApiError = require('../utils/apiError');

/**
 * Membuat campaign baru
 * @param {object} campaignBody
 * @returns {Promise<object>}
 */
const createCampaign = async (campaignBody) => {
  // Cek jika ada data yang diperlukan
  if (!campaignBody.campaign_name) {
    throw new ApiError(400, 'Nama campaign harus diisi');
  }
  return campaignModel.create(campaignBody);
};

/**
 * Mengambil semua campaign dengan pagination
 * @param {object} queryOptions - { page, limit, search }
 * @returns {Promise<object>}
 */
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

/**
 * Mengambil detail campaign berdasarkan ID
 * @param {number} campaignId
 * @returns {Promise<object>}
 */
const getCampaignById = async (campaignId) => {
  const campaign = await campaignModel.findById(campaignId);
  if (!campaign) {
    throw new ApiError(404, 'Campaign tidak ditemukan');
  }
  return campaign;
};

/**
 * Meng-update campaign berdasarkan ID
 * @param {number} campaignId
 * @param {object} updateBody
 * @returns {Promise<object>}
 */
const updateCampaignById = async (campaignId, updateBody) => {
  // Cek dulu apakah campaign-nya ada
  await getCampaignById(campaignId);

  if (!updateBody.campaign_name) {
    throw new ApiError(400, 'Nama campaign harus diisi');
  }

  return campaignModel.update(campaignId, updateBody);
};

/**
 * Menghapus campaign berdasarkan ID
 * @param {number} campaignId
 * @returns {Promise<void>}
 */
const deleteCampaignById = async (campaignId) => {
  await getCampaignById(campaignId); // Cek apakah ada
  await campaignModel.deleteById(campaignId);
};

module.exports = {
  createCampaign,
  queryCampaigns,
  getCampaignById,
  updateCampaignById,
  deleteCampaignById,
};