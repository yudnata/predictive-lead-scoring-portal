const historyModel = require('../models/history.model');
const ApiError = require('../utils/apiError');

const queryHistory = async (user, queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';
  const campaignId = queryOptions.campaign_id || queryOptions.campaignId || null;
  const startDate = queryOptions.start_date || queryOptions.startDate || null;
  const endDate = queryOptions.end_date || queryOptions.endDate || null;
  const statusId = queryOptions.status_id || queryOptions.statusId || null;

  const options = {
    role: user.role_name,
    userId: user.user_id,
    limit,
    offset,
    search,
    campaignId,
    startDate,
    endDate,
    statusId,
  };

  const historyLogs = await historyModel.findAll(options);
  const totalLogs = await historyModel.countAll(options);
  const totalPages = Math.ceil(totalLogs / limit);

  return {
    data: historyLogs,
    meta: {
      total: totalLogs,
      page,
      limit,
      totalPages,
    },
  };
};

const deleteHistory = async (historyId) => {
  const historyRecord = await historyModel.findById(historyId);
  if (!historyRecord) {
    throw new ApiError(404, 'History record not found');
  }

  const leadsTrackerModel = require('../models/leadsTracker.model');

  await leadsTrackerModel.updateStatusByLeadAndCampaign(
    historyRecord.lead_id,
    historyRecord.campaign_id,
    4,
    historyRecord.changed_by
  );
  const deleted = await historyModel.deleteById(historyId);
  return deleted;
};

module.exports = {
  queryHistory,
  deleteHistory,
};
