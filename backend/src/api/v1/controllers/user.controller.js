const userService = require('../services/user.service');
const ApiError = require('../utils/apiError');

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

exports.deleteSalesUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await userService.deleteSalesUserById(userId);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSalesUsers = async (req, res, next) => {
  try {
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
