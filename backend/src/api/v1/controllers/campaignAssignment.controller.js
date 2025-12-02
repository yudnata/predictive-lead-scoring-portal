const assignmentService = require("../services/campaignAssignment.service");

// ADMIN assign banyak sales ke 1 campaign
exports.assignSalesToCampaign = async (req, res, next) => {
  try {
    const { sales_ids, campaign_id } = req.body;

    if (!Array.isArray(sales_ids) || sales_ids.length === 0) {
      throw new ApiError(400, "sales_ids harus berupa array dan tidak boleh kosong");
    }

    const results = [];

    for (const salesId of sales_ids) {
      const assigned = await assignmentService.assignSalesToCampaign(salesId, campaign_id);
      results.push(assigned);
    }

    res.status(201).json({
      status: "success",
      message: "Sales berhasil di-assign ke campaign",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// Ambil semua sales yang di-assign ke campaign tertentu
exports.getAssignmentsByCampaign = async (req, res, next) => {
  try {
    const campaignId = req.params.campaignId;

    const sales = await assignmentService.getAssignmentsByCampaign(campaignId);

    res.status(200).json({
      status: "success",
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

// Sales melihat campaign yang di-assign ke dia
exports.getMyAssignedCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.user_id; // ambil dari token JWT

    const campaigns = await assignmentService.getMyAssignedCampaigns(userId);

    res.status(200).json({
      status: "success",
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};
