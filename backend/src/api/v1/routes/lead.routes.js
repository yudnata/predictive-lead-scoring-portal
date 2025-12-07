const express = require('express');
const leadController = require('../controllers/lead.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const noteRoutes = require('./note.routes');

const router = express.Router();
router.use(protect);

router.get('/', authorize('admin', 'sales'), leadController.getAllLeads);

router.post('/', authorize('admin'), leadController.createLead);

router.post('/batch-delete', authorize('admin'), leadController.batchDeleteLeads);

router.post(
  '/upload-csv',
  authorize('admin'),
  upload.single('file'),
  leadController.uploadLeadsCSV
);

router.get('/:leadId/campaigns', authorize('admin', 'sales'), leadController.getCampaignsByLeadId);

router.get('/:leadId', authorize('admin', 'sales'), leadController.getLeadById);

router.patch('/:leadId', authorize('admin'), leadController.updateLead);

router.delete('/:leadId', authorize('admin'), leadController.deleteLead);

router.use('/:leadId/notes', noteRoutes);

module.exports = router;
