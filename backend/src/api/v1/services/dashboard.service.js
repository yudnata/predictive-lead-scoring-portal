const dashboardModel = require('../models/dashboard.model');

const getDashboardData = async (user) => {
  const [
    stats,
    scoreDistribution,
    topLeads,
    topCampaigns,
    conversionRateTrend,
  ] = await Promise.all([
    dashboardModel.getStats(),
    dashboardModel.getScoreDistribution(),
    dashboardModel.getTopLeads(),
    dashboardModel.getTopCampaigns(),
    dashboardModel.getConversionRateTrend(),
  ]);

  return {
    ...stats,
    distributionLeadsScore: scoreDistribution,
    topHighestLeadsScore: topLeads,
    topCampaignByConversion: topCampaigns,
    conversionRateTrend: conversionRateTrend,
  };
};

module.exports = {
  getDashboardData,
};