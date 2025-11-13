exports.getHistory = async (req, res, next) => {
  try {
    // Logika filter berdasarkan role
    res.status(200).json({
      message: `getHistory for ${req.user.role_name} not implemented`,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};