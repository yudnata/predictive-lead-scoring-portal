const campaignService = require('../services/campaign.service');
const ApiError = require('../utils/apiError');

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

exports.getAllCampaigns = async (req, res, next) => {
  try {
    // req.user.user_id tersedia jika user sudah login (oleh middleware protect)
    const userId = req.user?.roles_id === 2 ? req.user.user_id : null; // Asumsi roles_id 2 adalah 'sales'
    
    const result = await campaignService.queryCampaigns(req.query, userId);
    res.status(200).json({
      status: 'success',
      message: 'Data campaigns berhasil diambil',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// exports.getAllCampaigns = async (req, res, next) => {
//   try {
//     const result = await campaignService.queryCampaigns(req.query);
//     res.status(200).json({
//       status: 'success',
//       message: 'Data campaigns berhasil diambil',
//       ...result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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