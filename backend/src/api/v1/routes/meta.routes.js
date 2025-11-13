const express = require('express');
const metaController = require('../controllers/meta.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Proteksi, tapi bisa diakses semua role yang login
router.use(protect);

router.get('/jobs', metaController.getJobs);
router.get('/marital-status', metaController.getMaritalStatus);
router.get('/education-levels', metaController.getEducationLevels);
router.get('/statuses', metaController.getStatuses);
// ... etc

module.exports = router;