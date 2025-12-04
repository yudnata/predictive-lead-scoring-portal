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
    const campaign = await campaignService.updateCampaignById(campaignId, req.body);
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
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCampaigns = async (req, res, next) => {
  try {
    const result = await campaignService.queryCampaigns(req.query, null);
    res.status(200).json({
      status: 'success',
      message: 'Data campaigns berhasil diambil',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

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

exports.getCampaignOptions = async (req, res, next) => {
  try {
    const options = await campaignService.getCampaignOptions();
    res.status(200).json({
      status: 'success',
      data: options,
    });
  } catch (error) {
    next(error);
  }
};
