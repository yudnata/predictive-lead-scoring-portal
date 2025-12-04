const express = require('express');
const historyController = require('../controllers/history.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'sales'));

router.get('/', historyController.getHistory);
router.delete('/:historyId', authorize('admin'), historyController.deleteHistory);

module.exports = router;
