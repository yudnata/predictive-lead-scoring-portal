const campaignLeadService = require('../services/campaignLead.service');
const ApiError = require('../utils/apiError');

exports.assignLead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    if (req.user.role_name !== 'sales') {
      throw new ApiError(403, 'Hanya Sales yang bisa menautkan lead');
    }

    const result = await campaignLeadService.assignLeadToCampaign(userId, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Lead successfully linked to campaign',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { campaignLeadId } = req.params;
    const { status_id } = req.body;
    const userId = req.user.user_id;

    if (req.user.role_name !== 'sales') {
      throw new ApiError(403, 'Hanya Sales yang bisa update status');
    }

    const result = await campaignLeadService.updateLeadStatus(campaignLeadId, userId, status_id);

    res.status(200).json({
      status: 'success',
      message: 'Lead status updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTracker = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    if (req.user.role_name !== 'sales') {
      throw new ApiError(403, 'Hanya Sales yang memiliki Leads Tracker');
    }

    const result = await campaignLeadService.getSalesLeadTracker(userId, req.query);

    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const { campaignLeadId } = req.params;
    const { status_id } = req.body;
    const adminUserId = req.user.user_id;

    const result = await campaignLeadService.adminUpdateLeadStatus(
      campaignLeadId,
      status_id,
      adminUserId
    );

    res.status(200).json({
      status: 'success',
      message: 'Lead status updated successfully by Admin',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCampaignLead = async (req, res, next) => {
  try {
    const { campaignLeadId } = req.params;
    const userId = req.user.user_id;

    if (req.user.role_name !== 'sales') {
      throw new ApiError(403, 'Hanya Sales yang bisa menghapus lead dari tracker');
    }

    await campaignLeadService.deleteCampaignLead(campaignLeadId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Lead successfully removed from tracking',
    });
  } catch (error) {
    next(error);
  }
};
