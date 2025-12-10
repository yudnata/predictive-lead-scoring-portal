const userModel = require('../models/user.model');
const { comparePassword } = require('../utils/password.helper');
const { generateToken } = require('../utils/jwt.helper');
const ApiError = require('../utils/apiError');

const loginUser = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'Your account is inactive. Please contact admin.');
  }

  const token = generateToken(user.user_id, user.role_name);
  delete user.password;

  return { user, token };
};

module.exports = {
  loginUser,
};
