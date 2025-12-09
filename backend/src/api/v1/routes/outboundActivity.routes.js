const express = require('express');
const router = express.Router();
const OutboundActivityController = require('../controllers/outboundActivity.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, OutboundActivityController.createActivity);
router.get('/:leadId', protect, OutboundActivityController.getActivityHistory);

module.exports = router;
