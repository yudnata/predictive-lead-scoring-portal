const authService = require('../services/auth.service');
const ApiError = require('../utils/apiError');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const { user, token } = await authService.loginUser(email, password);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.user_email,
          role: user.role_name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.user_email,
        role: user.role_name,
        address: user.address,
        country: user.country,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
