const historyService = require('../services/history.service');

exports.getHistory = async (req, res, next) => {
  try {
    const result = await historyService.queryHistory(req.user, req.query);

    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHistory = async (req, res, next) => {
  try {
    const { historyId } = req.params;
    await historyService.deleteHistory(historyId);

    res.status(200).json({
      status: 'success',
      message: 'History deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
