const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const leadRoutes = require('./lead.routes');
const campaignRoutes = require('./campaign.routes');
const dashboardRoutes = require('./dashboard.routes');
const historyRoutes = require('./history.routes');
const metaRoutes = require('./meta.routes');

const router = express.Router();

// Pasang semua rute
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/history', historyRoutes);
router.use('/meta', metaRoutes); // Rute untuk data master (dropdown)

module.exports = router;