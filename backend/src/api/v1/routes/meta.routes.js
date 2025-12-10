const express = require('express');
const metaController = require('../controllers/meta.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.use(protect);
router.use(authorize('admin', 'sales'));

router.get('/jobs', metaController.getJobs);
router.get('/marital-status', metaController.getMaritalStatus);
router.get('/education-levels', metaController.getEducationLevels);
router.get('/p-outcomes', metaController.getPoutcomes);
router.get('/statuses', metaController.getStatuses);
router.get('/contact-methods', metaController.getContactMethods);

module.exports = router;
