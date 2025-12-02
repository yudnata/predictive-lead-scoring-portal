const assignmentModel = require("../models/campaignAssignment.model");
const ApiError = require("../utils/apiError");

exports.assignSalesToCampaign = async (userId, campaignId) => {
console.log("SERVICE userId:", userId, "campaignId:", campaignId);
  if (!userId || !campaignId) {
    throw new ApiError(400, "user_id dan campaign_id wajib diisi");
  }

  return assignmentModel.create(userId, campaignId);
};


exports.getAssignmentsByCampaign = async (campaignId) => {
  return assignmentModel.findSalesByCampaign(campaignId);
};

exports.getMyAssignedCampaigns = async (userId) => {
  return assignmentModel.findCampaignsBySales(userId);
};

exports.resetAssignments = async (campaignId, userIds = []) => {
  await assignmentModel.deleteByCampaign(campaignId);

  if (!Array.isArray(userIds) || userIds.length === 0) {
    console.log("⚠️ RESET SKIPPED: Tidak ada userIds dikirim");
    return;
  }

  for (const userId of userIds) {
    if (!userId) continue; // hindari undefined
    await assignmentModel.create(userId, campaignId);
  }
};


