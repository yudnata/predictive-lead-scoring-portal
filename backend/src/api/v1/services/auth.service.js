const userModel = require('../models/user.model');
const { comparePassword } = require('../utils/password.helper');
const { generateToken } = require('../utils/jwt.helper');
const ApiError = require('../utils/apiError');

/**
 * Logika bisnis untuk login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
const loginUser = async (email, password) => {
  // 1. Cari user berdasarkan email
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Email atau password salah');
  }

  // 2. Bandingkan password
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Email atau password salah');
  }
  
  // 3. Cek jika user aktif
  if (!user.is_active) {
      throw new ApiError(403, 'Akun Anda non-aktif. Silakan hubungi admin.');
  }

  // 4. Buat JWT
  const token = generateToken(user.user_id, user.role_name);

  // 5. Hapus password dari objek user sebelum dikembalikan
  delete user.password;

  return { user, token };
};

module.exports = {
  loginUser,
};