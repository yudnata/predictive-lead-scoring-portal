const OutboundActivityService = require('../services/outboundActivity.service');

const createActivity = async (req, res, next) => {
  try {
    const activityData = req.body;
    if (!activityData.user_id && req.user) {
      activityData.user_id = req.user.user_id;
    }

    const activity = await OutboundActivityService.logActivity(activityData);
    res.status(201).json({
      status: 'success',
      message: 'Outbound activity logged successfully',
      data: activity,
    });
  } catch (error) {
    console.error('Error logging outbound activity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to log activity',
      error: error.message,
    });
  }
};

const getActivityHistory = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { campaign_id } = req.query;
    const history = await OutboundActivityService.getHistory(leadId, campaign_id);
    res.status(200).json({
      status: 'success',
      message: 'Activity history retrieved',
      data: history,
    });
  } catch (error) {
    console.error('Error fetching activity history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch history',
      error: error.message,
    });
  }
};

module.exports = {
  createActivity,
  getActivityHistory,
};
