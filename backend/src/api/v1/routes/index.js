const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const leadRoutes = require('./lead.routes');
const campaignRoutes = require('./campaign.routes');
const dashboardRoutes = require('./dashboard.routes');
const historyRoutes = require('./history.routes');
const metaRoutes = require('./meta.routes');
const noteRoutes = require('./note.routes');
const campaignLeadRoutes = require('./campaignLead.routes');
const leadsTrackerRoutes = require('./leadsTracker.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/history', historyRoutes);
router.use('/meta', metaRoutes);
router.use('/note', noteRoutes);
router.use('/campaign-leads', campaignLeadRoutes);
router.use('/leads-tracker', leadsTrackerRoutes);

router.use('/campaign-assignments', require('./campaignAssignment.route'));

module.exports = router;
