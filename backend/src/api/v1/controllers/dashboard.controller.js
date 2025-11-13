exports.getDashboardData = async (req, res, next) => {
  try {
    // Di sini akan ada logika:
    // if (req.user.role_name === 'admin') { ... }
    // else if (req.user.role_name === 'sales') { ... }
    res.status(200).json({
      message: `getDashboardData for ${req.user.role_name} not implemented`,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};