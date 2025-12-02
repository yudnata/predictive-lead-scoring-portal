const dashboardService = require('../services/dashboard.service');

exports.getDashboardData = async (req, res, next) => {
  try {

    const dashboardData = await dashboardService.getDashboardData(req.user);
    
    res.status(200).json({
      status: 'success',
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};