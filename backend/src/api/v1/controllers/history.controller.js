const historyService = require('../services/history.service');

exports.getHistory = async (req, res, next) => {
  try {
    // Service akan mem-filter berdasarkan role dari req.user
    const result = await historyService.queryHistory(req.user, req.query);
    
    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};