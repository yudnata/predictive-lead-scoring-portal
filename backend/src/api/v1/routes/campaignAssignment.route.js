const express = require('express');
const router = express.Router();

const assignmentController = require('../controllers/campaignAssignment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.post('/', authorize('admin'), assignmentController.assignSalesToCampaign);

router.get(
  '/campaign/:campaignId',
  authorize('admin', 'sales'),
  assignmentController.getAssignmentsByCampaign
);

router.get('/my-assignments', authorize('sales'), assignmentController.getMyAssignedCampaigns);

module.exports = router;
