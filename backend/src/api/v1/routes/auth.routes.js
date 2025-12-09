const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter.middleware');
const { loginValidation } = require('../middlewares/validation.middleware');

const router = express.Router();

router.post('/login', loginLimiter, loginValidation, authController.login);

router.get('/me', protect, authController.getMe);

module.exports = router;
