const leadsTrackerModel = require('../models/leadsTracker.model');
const leadModel = require('../models/lead.model');
const ApiError = require('../utils/apiError');

const queryLeadsForSales = async (queryOptions, userId, minStatusName = null) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';
  const campaignId = queryOptions.campaign_id || queryOptions.campaignId || null;
  const minScore = queryOptions.min_score || queryOptions.minScore || null;
  const maxScore = queryOptions.max_score || queryOptions.maxScore || null;

  const options = {
    limit,
    offset,
    search,
    campaignId,
    minStatusName: minStatusName || queryOptions.minStatusName,
    minScore,
    maxScore,
    userId,
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
    throw new ApiError(400, 'Status ID is required');
  }

  const isDeal = parseInt(statusId) === 5;
  const isReject = parseInt(statusId) === 6;

  if (isDeal || isReject) {
    let poutcomeName = isDeal ? 'Success' : 'Failure';

    const poutcome = await leadsTrackerModel.findPoutcomeByName(poutcomeName);
    let poutcomeId = poutcome ? poutcome.poutcome_id : null;
    if (!poutcomeId) {
      const otherPoutcome = await leadsTrackerModel.findPoutcomeByName('Other');
      poutcomeId = otherPoutcome ? otherPoutcome.poutcome_id : null;
    }
  }

  const updatedLead = await leadsTrackerModel.updateStatus(leadCampaignId, statusId, userId);

  if (!updatedLead) {
    throw new ApiError(404, 'Lead campaign not found or you do not have access');
  }

  await leadsTrackerModel.createStatusHistory(
    updatedLead.lead_id,
    updatedLead.campaign_id,
    statusId,
    userId
  );

  if (parseInt(statusId) === 4) {
    const now = new Date();
    const day = now.getDate();
    const monthIndex = now.getMonth();
    const monthId = monthIndex + 1;

    const currentLead = await leadModel.findFullLeadById(updatedLead.lead_id);

    const updateData = {
      last_contact_day: day,
      month_id: monthId,
      pdays: 0,
      prev_contact_count: (currentLead.prev_contact_count || 0) + 1,
    };

    await leadModel.update(updatedLead.lead_id, {}, updateData);
  }

  if (isDeal || isReject) {
    let poutcomeName = isDeal ? 'Success' : 'Failure';
    const poutcome = await leadsTrackerModel.findPoutcomeByName(poutcomeName);
    let poutcomeId = poutcome ? poutcome.poutcome_id : null;

    if (!poutcomeId) {
      const otherPoutcome = await leadsTrackerModel.findPoutcomeByName('Other');
      poutcomeId = otherPoutcome ? otherPoutcome.poutcome_id : null;
    }

    if (poutcomeId) {
      await leadModel.update(updatedLead.lead_id, {}, { poutcome_id: poutcomeId });
    }

    await leadsTrackerModel.deleteById(leadCampaignId);
  }

  return updatedLead;
};

module.exports = {
  queryLeadsForSales,
  updateLeadStatus,
};
