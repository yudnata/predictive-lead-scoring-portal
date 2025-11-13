const campaignService = require('../services/campaign.service');
const ApiError = require('../utils/apiError');

// @desc    Membuat Campaign baru
// @route   POST /api/v1/campaigns
// @access  Private (Admin)
exports.createCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.createCampaign(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Campaign berhasil dibuat',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Meng-update Campaign
// @route   PATCH /api/v1/campaigns/:campaignId
// @access  Private (Admin)
exports.updateCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const campaign = await campaignService.updateCampaignById(
      campaignId,
      req.body
    );
    res.status(200).json({
      status: 'success',
      message: 'Campaign berhasil diupdate',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Menghapus Campaign
// @route   DELETE /api/v1/campaigns/:campaignId
// @access  Private (Admin)
exports.deleteCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    await campaignService.deleteCampaignById(campaignId);
    res.status(204).json({
      status: 'success',
      data: null, // 204 No Content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mengambil semua Campaign
// @route   GET /api/v1/campaigns
// @access  Private (Admin, Sales)
exports.getAllCampaigns = async (req, res, next) => {
  try {
    // req.query akan berisi (misal: ?page=1&limit=10&search=KPR)
    const result = await campaignService.queryCampaigns(req.query);
    res.status(200).json({
      status: 'success',
      message: 'Data campaigns berhasil diambil',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mengambil detail satu Campaign
// @route   GET /api/v1/campaigns/:campaignId
// @access  Private (Admin, Sales)
exports.getCampaignById = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const campaign = await campaignService.getCampaignById(campaignId);
    res.status(200).json({
      status: 'success',
      message: 'Detail campaign berhasil diambil',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};