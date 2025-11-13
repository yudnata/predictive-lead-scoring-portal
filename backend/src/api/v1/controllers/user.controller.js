const userService = require('../services/user.service');
const ApiError = require('../utils/apiError');

// @desc    Membuat user Sales baru
// @route   POST /api/v1/users
// @access  Private (Admin)
exports.createSalesUser = async (req, res, next) => {
  try {
    const user = await userService.createSalesUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User Sales berhasil dibuat',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Meng-update user Sales
// @route   PATCH /api/v1/users/:userId
// @access  Private (Admin)
exports.updateSalesUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.updateSalesUserById(userId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'User Sales berhasil diupdate',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Menghapus user Sales
// @route   DELETE /api/v1/users/:userId
// @access  Private (Admin)
exports.deleteSalesUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await userService.deleteSalesUserById(userId);
    res.status(204).json({
      status: 'success',
      data: null, // 204 No Content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mengambil semua user Sales
// @route   GET /api/v1/users
// @access  Private (Admin)
exports.getAllSalesUsers = async (req, res, next) => {
  try {
    // req.query (misal: ?page=1&limit=10&search=Sales)
    const result = await userService.querySalesUsers(req.query);
    res.status(200).json({
      status: 'success',
      message: 'Data user sales berhasil diambil',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mengambil detail satu user Sales
// @route   GET /api/v1/users/:userId
// @access  Private (Admin)
exports.getSalesUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.getSalesUserById(userId);
    res.status(200).json({
      status: 'success',
      message: 'Detail user sales berhasil diambil',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};