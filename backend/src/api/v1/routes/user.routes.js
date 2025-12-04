const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/', userController.getAllSalesUsers);
router.post('/', userController.createSalesUser);
router.get('/:userId', userController.getSalesUserById);
router.patch('/:userId', userController.updateSalesUser);
router.delete('/:userId', userController.deleteSalesUser);

module.exports = router;
