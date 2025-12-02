const leadsTrackerModel = require('../models/leadsTracker.model');
const ApiError = require('../utils/apiError');

const queryLeadsForSales = async (queryOptions, userId, minStatusName = null) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';
  const campaignId = queryOptions.campaign_id || null;

  const options = { 
    limit, 
    offset, 
    search, 
    campaignId, 
    minStatusName
  };

  const leads = await leadsTrackerModel.findAllBySales(options);
  const totalLeads = await leadsTrackerModel.countAllBySales(options);
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

const updateLeadStatus = async (leadCampaignId, statusId, userId) => {
    if (!statusId) {
        throw new ApiError(400, 'Status ID harus diisi');
    }

    // 2. Update status di tb_campaign_leads
    const updatedLead = await leadsTrackerModel.updateStatus(leadCampaignId, statusId, userId);

    if (!updatedLead) {
         throw new ApiError(404, 'Lead campaign tidak ditemukan atau Anda tidak memiliki akses');
    }

    // 3. Catat ke history (tb_lead_status_history)
    await leadsTrackerModel.createStatusHistory(
        updatedLead.lead_id, 
        updatedLead.campaign_id, 
        statusId, 
        userId
    );

    return updatedLead;
};


module.exports = {
  queryLeadsForSales,
  updateLeadStatus,
};