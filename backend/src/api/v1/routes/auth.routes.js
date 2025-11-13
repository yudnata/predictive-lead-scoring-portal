const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/v1/auth/me
// @desc    Get current user profile
// @access  Private (All roles)
router.get('/me', protect, authController.getMe);

module.exports = router;