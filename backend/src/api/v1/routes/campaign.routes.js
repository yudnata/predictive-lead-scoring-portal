const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Proteksi semua rute
router.use(protect);

// Rute khusus Admin
router.post('/', authorize('admin'), campaignController.createCampaign);
router.patch('/:campaignId', authorize('admin'), campaignController.updateCampaign);
router.delete('/:campaignId', authorize('admin'), campaignController.deleteCampaign);

// Rute untuk Admin dan Sales (misal: untuk dropdown)
router.get('/', authorize('admin', 'sales'), campaignController.getAllCampaigns);
router.get('/:campaignId', authorize('admin', 'sales'), campaignController.getCampaignById);


module.exports = router;