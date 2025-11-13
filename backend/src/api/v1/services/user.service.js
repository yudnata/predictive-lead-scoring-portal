const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/password.helper');
const ApiError = require('../utils/apiError');

/**
 * Membuat user sales baru
 * @param {object} userBody - Data user dari request body
 * @returns {Promise<object>} User yang baru dibuat
 */
const createSalesUser = async (userBody) => {
  const { user_email, password, full_name, is_active } = userBody;

  // 1. Validasi input
  if (!user_email || !password || !full_name) {
    throw new ApiError(400, 'Email, password, dan nama lengkap harus diisi');
  }

  // 2. Cek apakah email sudah ada
  const existingUser = await userModel.findByEmail(user_email);
  if (existingUser) {
    throw new ApiError(400, 'Email sudah terdaftar');
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Siapkan data untuk model
  // Kita asumsikan role_id 'sales' = 2 (sesuai db_schema.sql)
  const newUserdata = {
    ...userBody,
    password: hashedPassword,
    roles_id: 2, // Hardcoded ID untuk 'sales'
    is_active: is_active !== undefined ? is_active : true, // Default true
  };

  // 5. Buat user
  const newUser = await userModel.create(newUserdata);
  delete newUser.password; // Jangan kembalikan password
  return newUser;
};

/**
 * Mengambil semua user sales dengan pagination & search
 * @param {object} queryOptions - { page, limit, search }
 * @returns {Promise<object>}
 */
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

/**
 * Mengambil detail user sales berdasarkan ID
 * @param {number} userId
 * @returns {Promise<object>}
 */
const getSalesUserById = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user || user.role_name !== 'sales') {
    throw new ApiError(404, 'User Sales tidak ditemukan');
  }
  delete user.password;
  return user;
};

/**
 * Meng-update user sales berdasarkan ID
 * @param {number} userId
 * @param {object} updateBody
 * @returns {Promise<object>}
 */
const updateSalesUserById = async (userId, updateBody) => {
  // Cek dulu apakah user-nya ada
  await getSalesUserById(userId);

  // Jika email diubah, cek duplikat
  if (updateBody.user_email) {
    const existingUser = await userModel.findByEmail(updateBody.user_email);
    // Cek jika email tsb milik user LAIN
    if (existingUser && existingUser.user_id !== parseInt(userId, 10)) {
      throw new ApiError(400, 'Email sudah digunakan oleh user lain');
    }
  }

  // Kita tidak mengizinkan update password atau role di endpoint ini
  // (UI Admin- Add Sales.png tidak menunjukkan field password)
  delete updateBody.password;
  delete updateBody.roles_id;

  const updatedUser = await userModel.update(userId, updateBody);
  delete updatedUser.password;
  return updatedUser;
};

/**
 * Menghapus user sales berdasarkan ID
 * @param {number} userId
 * @returns {Promise<void>}
 */
const deleteSalesUserById = async (userId) => {
  await getSalesUserById(userId); // Cek apakah ada
  await userModel.deleteById(userId);
};

module.exports = {
  createSalesUser,
  querySalesUsers,
  getSalesUserById,
  updateSalesUserById,
  deleteSalesUserById,
};