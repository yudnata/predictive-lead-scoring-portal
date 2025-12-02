const historyModel = require('../models/history.model');
const ApiError = require('../utils/apiError');

const queryHistory = async (user, queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';
  const campaignId = queryOptions.campaign_id || null;
  
  const options = { 
    role: user.role_name, 
    userId: user.user_id,
    limit, 
    offset, 
    search, 
    campaignId 
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

module.exports = {
  queryHistory,
};