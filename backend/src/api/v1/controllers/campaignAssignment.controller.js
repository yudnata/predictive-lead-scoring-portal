const assignmentService = require('../services/campaignAssignment.service');

exports.assignSalesToCampaign = async (req, res, next) => {
  try {
    const { sales_ids, campaign_id } = req.body;

    if (!Array.isArray(sales_ids) || sales_ids.length === 0) {
      throw new ApiError(400, 'sales_ids harus berupa array dan tidak boleh kosong');
    }

    const results = [];

    for (const salesId of sales_ids) {
      const assigned = await assignmentService.assignSalesToCampaign(salesId, campaign_id);
      results.push(assigned);
    }

    res.status(201).json({
      status: 'success',
      message: 'Sales berhasil di-assign ke campaign',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentsByCampaign = async (req, res, next) => {
  try {
    const campaignId = req.params.campaignId;

    const sales = await assignmentService.getAssignmentsByCampaign(campaignId);

    res.status(200).json({
      status: 'success',
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyAssignedCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const campaigns = await assignmentService.getMyAssignedCampaigns(userId);

    res.status(200).json({
      status: 'success',
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};
