const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  createCampaignValidation,
  idParamValidation,
  queryPaginationValidation,
} = require('../middlewares/validation.middleware');

const router = express.Router();
router.use(protect);

router.post('/', authorize('admin'), createCampaignValidation, campaignController.createCampaign);
router.patch('/:campaignId', authorize('admin'), idParamValidation, campaignController.updateCampaign);
router.delete('/:campaignId', authorize('admin'), idParamValidation, campaignController.deleteCampaign);

router.get('/', authorize('admin', 'sales'), queryPaginationValidation, campaignController.getAllCampaigns);
router.get('/options', authorize('admin', 'sales'), campaignController.getCampaignOptions);
router.get('/:campaignId', authorize('admin', 'sales'), idParamValidation, campaignController.getCampaignById);

module.exports = router;
