const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  createUserValidation,
  idParamValidation,
  queryPaginationValidation,
} = require('../middlewares/validation.middleware');

const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/', queryPaginationValidation, userController.getAllSalesUsers);
router.post('/', createUserValidation, userController.createSalesUser);
router.get('/:userId', idParamValidation, userController.getSalesUserById);
router.patch('/:userId', idParamValidation, userController.updateSalesUser);
router.delete('/:userId', idParamValidation, userController.deleteSalesUser);

module.exports = router;
