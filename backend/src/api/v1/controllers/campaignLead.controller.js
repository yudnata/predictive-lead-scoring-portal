const campaignLeadService = require('../services/campaignLead.service');
const ApiError = require('../utils/apiError');

// @desc    Menautkan Lead ke Campaign (Assign)
// @route   POST /api/v1/campaign-leads/assign
// @access  Private (Sales)
exports.assignLead = async (req, res, next) => {
  try {
    const userId = req.user.user_id; // Dari token
    
    if (req.user.role_name !== 'sales') {
      throw new ApiError(403, 'Hanya Sales yang bisa menautkan lead');
    }
    
    const result = await campaignLeadService.assignLeadToCampaign(userId, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Lead berhasil ditautkan ke campaign',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Status Lead (Deal, Reject, dll) oleh SALES
// @route   PATCH /api/v1/campaign-leads/:campaignLeadId/status
// @access  Private (Sales)
exports.updateStatus = async (req, res, next) => {
  try {
    const { campaignLeadId } = req.params;
    const { status_id } = req.body;
    const userId = req.user.user_id; // Dari token

    if (req.user.role_name !== 'sales') {
      throw new ApiError(403, 'Hanya Sales yang bisa update status');
    }

    const result = await campaignLeadService.updateLeadStatus(
      campaignLeadId,
      userId,
      status_id
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Status lead berhasil diupdate',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get data untuk 'Leads Tracker'
// @route   GET /api/v1/campaign-leads/my-tracker
// @access  Private (Sales)
exports.getTracker = async (req, res, next) => {
  try {
    const userId = req.user.user_id; // Dari token

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

// @desc    (ADMIN) Override/Update Status Lead
// @route   PATCH /api/v1/campaign-leads/:campaignLeadId/admin-update-status
// @access  Private (Admin)
exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const { campaignLeadId } = req.params;
    const { status_id } = req.body;
    const adminUserId = req.user.user_id; // Dari token (sudah divalidasi 'admin' oleh authorize)

    const result = await campaignLeadService.adminUpdateLeadStatus(
      campaignLeadId,
      status_id,
      adminUserId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Status lead berhasil diupdate oleh Admin',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};