const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/password.helper');
const ApiError = require('../utils/apiError');

const createSalesUser = async (userBody) => {
  const { user_email, password, full_name, is_active } = userBody;

  if (!user_email || !password || !full_name) {
    throw new ApiError(400, 'Email, password, dan nama lengkap harus diisi');
  }

  const existingUser = await userModel.findByEmail(user_email);
  if (existingUser) {
    throw new ApiError(400, 'Email sudah terdaftar');
  }

  const hashedPassword = await hashPassword(password);

  const newUserdata = {
    ...userBody,
    password: hashedPassword,
    roles_id: 2,
    is_active: is_active !== undefined ? is_active : true,
  };

  const newUser = await userModel.create(newUserdata);
  delete newUser.password;
  return newUser;
};

const querySalesUsers = async (queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';

  const options = { limit, offset, search };

  const users = await userModel.findAllSales(options);
  const totalUsers = await userModel.countAllSales(options);
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    data: users,
    meta: {
      total: totalUsers,
      page,
      limit,
      totalPages,
    },
  };
};

const getSalesUserById = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user || user.role_name !== 'sales') {
    throw new ApiError(404, 'User Sales tidak ditemukan');
  }
  delete user.password;
  return user;
};

const updateSalesUserById = async (userId, updateBody) => {
  await getSalesUserById(userId);

  if (updateBody.user_email) {
    const existingUser = await userModel.findByEmail(updateBody.user_email);
    if (existingUser && existingUser.user_id !== parseInt(userId, 10)) {
      throw new ApiError(400, 'Email sudah digunakan oleh user lain');
    }
  }
  delete updateBody.password;
  delete updateBody.roles_id;

  const updatedUser = await userModel.update(userId, updateBody);
  delete updatedUser.password;
  return updatedUser;
};

const deleteSalesUserById = async (userId) => {
  await getSalesUserById(userId);
  await userModel.deleteById(userId);
};

module.exports = {
  createSalesUser,
  querySalesUsers,
  getSalesUserById,
  updateSalesUserById,
  deleteSalesUserById,
};