const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.use(protect);
router.use(authorize('admin', 'sales'));

router.get('/', dashboardController.getDashboardData);

module.exports = router;