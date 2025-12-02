const leadsTrackerService = require('../services/leadsTracker.service');
const ApiError = require('../utils/apiError');

exports.getAllLeadsForSales = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await leadsTrackerService.queryLeadsForSales(req.query, userId);

    res.status(200).json({
      status: 'success',
      message: 'Data leads tracker berhasil diambil',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { leadCampaignId } = req.params;
    const { status_id } = req.body;
    const updatedLead = await leadsTrackerService.updateLeadStatus(
      leadCampaignId,
      status_id,
      req.user.user_id
    );

    res.status(200).json({
      status: 'success',
      message: 'Status lead berhasil diupdate',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};
