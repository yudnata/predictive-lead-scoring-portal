const express = require('express');
const leadController = require('../controllers/lead.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { uploadLimiter, strictLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  createLeadValidation,
  updateLeadValidation,
  batchDeleteValidation,
  queryPaginationValidation,
  idParamValidation,
} = require('../middlewares/validation.middleware');
const noteRoutes = require('./note.routes');

const router = express.Router();

router.get('/upload-status/:sessionId', leadController.getUploadStatus);

router.use(protect);

router.get('/', authorize('admin', 'sales'), queryPaginationValidation, leadController.getAllLeads);

router.get('/segments', authorize('admin', 'sales'), leadController.getSegments);

router.get('/stats/segments', authorize('admin', 'sales'), leadController.getSegmentStats);

router.get('/:leadId/explain', authorize('admin', 'sales'), leadController.getLeadExplanation);

router.post('/', authorize('admin'), createLeadValidation, leadController.createLead);

router.post(
  '/batch-delete',
  authorize('admin'),
  strictLimiter,
  batchDeleteValidation,
  leadController.batchDeleteLeads
);

router.post(
  '/upload-csv',
  authorize('admin'),
  uploadLimiter,
  upload.single('file'),
  leadController.uploadLeadsCSV
);

router.get(
  '/:leadId/campaigns',
  authorize('admin', 'sales'),
  idParamValidation,
  leadController.getCampaignsByLeadId
);

router.get('/:leadId', authorize('admin', 'sales'), idParamValidation, leadController.getLeadById);

router.patch('/:leadId', authorize('admin'), updateLeadValidation, leadController.updateLead);

router.delete(
  '/:leadId',
  authorize('admin'),
  strictLimiter,
  idParamValidation,
  leadController.deleteLead
);

router.use('/:leadId/notes', noteRoutes);

module.exports = router;
