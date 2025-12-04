const express = require('express');
const leadsTrackerController = require('../controllers/leadsTracker.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('sales'));

router.get('/', leadsTrackerController.getAllLeadsForSales);

router.patch('/:leadCampaignId/status', leadsTrackerController.updateLeadStatus);

module.exports = router;
