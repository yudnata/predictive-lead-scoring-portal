const ApiError = require('../utils/apiError');
const { verifyToken } = require('../utils/jwt.helper');
const userModel = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return next(new ApiError(401, 'Unauthorized: You must be logged in'));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new ApiError(401, 'Unauthorized: Invalid or expired token'));
    }

    const currentUser = await userModel.findById(payload.sub);
    if (!currentUser) {
      return next(
        new ApiError(401, 'Unauthorized: User associated with this token no longer exists')
      );
    }

    if (!currentUser.is_active) {
      return next(new ApiError(403, 'Forbidden: Your account is inactive'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
