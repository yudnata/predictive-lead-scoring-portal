const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.use(protect);

router.post('/', authorize('admin'), campaignController.createCampaign);
router.patch('/:campaignId', authorize('admin'), campaignController.updateCampaign);
router.delete('/:campaignId', authorize('admin'), campaignController.deleteCampaign);

router.get('/', authorize('admin', 'sales'), campaignController.getAllCampaigns);
router.get('/:campaignId', authorize('admin', 'sales'), campaignController.getCampaignById);


module.exports = router;