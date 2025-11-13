const bcrypt = require('bcryptjs');

/**
 * Membandingkan password plain-text dengan hash
 * @param {string} password - Password dari input user
 * @param {string} hashedPassword - Hash dari database
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * (Untuk nanti saat membuat user baru)
 * Membuat hash dari password
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

module.exports = {
  comparePassword,
  hashPassword,
};