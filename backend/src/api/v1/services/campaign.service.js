const campaignModel = require('../models/campaign.model');
const assignmentService = require("./campaignAssignment.service");
const ApiError = require('../utils/apiError');

const createCampaign = async (campaignBody) => {
  if (!campaignBody.campaign_name) {
    throw new ApiError(400, 'Nama campaign harus diisi');
  }
  return campaignModel.create(campaignBody);
};

const queryCampaigns = async (queryOptions, userId = null) => { 
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';

  const options = { limit, offset, search, userId }; 

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
  const existingCampaign = await getCampaignById(campaignId);

  const finalUpdateData = {
    ...existingCampaign,
    ...updateBody,
  };

  if ("campaign_is_active" in updateBody) {
    const value = updateBody.campaign_is_active;
    finalUpdateData.campaign_is_active =
      typeof value === "string" ? value.toLowerCase() === "true" : Boolean(value);
    }

  // UPDATE campaign table
  const updatedCampaign = await campaignModel.update(campaignId, finalUpdateData);

  // HANDLE SALES ASSIGNMENTS
  if (Array.isArray(updateBody.assigned_sales)) {
    // --- PERBAIKAN DI SINI ---
    // Jika data yang dikirim dari frontend berupa array of IDs (misalnya [1, 5, 8]),
    // maka kita harus memastikannya.
    const sampleItem = updateBody.assigned_sales[0];
    let userIds;

    // Jika item pertama adalah objek dan memiliki user_id (dari `initialData` di frontend saat edit)
    if (typeof sampleItem === 'object' && sampleItem !== null && 'user_id' in sampleItem) {
        userIds = updateBody.assigned_sales.map((s) => s.user_id);
    // Jika item pertama adalah number (dari `selectedSales` di CampaignFormModal)
    } else if (typeof sampleItem === 'number' || (typeof sampleItem === 'string' && !isNaN(parseInt(sampleItem)))) {
        userIds = updateBody.assigned_sales.map(String); // Ubah ke string untuk konsistensi jika dibutuhkan
    } else {
        // Asumsikan array of IDs jika tidak ada user_id field
        userIds = updateBody.assigned_sales; 
    }
    
    // Filter nilai-nilai yang tidak valid (seperti undefined)
    const validUserIds = userIds.filter(id => id != null && id !== '');
    
    await assignmentService.resetAssignments(campaignId, validUserIds);
    // -------------------------
  }

  return updatedCampaign;
};

// const updateCampaignById = async (campaignId, updateBody) => {
//   const existingCampaign = await getCampaignById(campaignId);

//   const finalUpdateData = {
//     ...existingCampaign,
//     ...updateBody,
//   };

//   if ("campaign_is_active" in updateBody) {
//     const value = updateBody.campaign_is_active;
//     finalUpdateData.campaign_is_active =
//       typeof value === "string" ? value.toLowerCase() === "true" : Boolean(value);
//   }

//   // UPDATE campaign table
//   const updatedCampaign = await campaignModel.update(campaignId, finalUpdateData);

//   // HANDLE SALES ASSIGNMENTS
//   if (Array.isArray(updateBody.assigned_sales)) {
//     const userIds = updateBody.assigned_sales.map((s) => s.user_id);
//     await assignmentService.resetAssignments(campaignId, userIds);
//   }

//   return updatedCampaign;
// };

// const updateCampaignById = async (campaignId, updateBody) => {
//   const existingCampaign = await getCampaignById(campaignId);

//   if ('campaign_name' in updateBody && !updateBody.campaign_name) {
//     throw new ApiError(400, 'Nama campaign harus diisi');
//   }

//   const finalUpdateData = {
//     ...existingCampaign,
//     ...updateBody,
//   };

//   if ('campaign_is_active' in updateBody) {
//     const value = updateBody.campaign_is_active;

//     if (typeof value === 'string') {
//       finalUpdateData.campaign_is_active = value.toLowerCase() === 'true';
//     } else {
//       finalUpdateData.campaign_is_active = Boolean(value);
//     }
//   }

//   return campaignModel.update(campaignId, finalUpdateData);
// };

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