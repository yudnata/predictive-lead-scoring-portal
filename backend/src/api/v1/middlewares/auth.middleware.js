const ApiError = require('../utils/apiError');
const { verifyToken } = require('../utils/jwt.helper');
const userModel = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Unauthorized: Anda harus login'));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new ApiError(401, 'Unauthorized: Token tidak valid atau kedaluwarsa'));
    }

    const currentUser = await userModel.findById(payload.sub);
    if (!currentUser) {
      return next(
        new ApiError(401, 'Unauthorized: User pemilik token ini sudah tidak ada')
      );
    }
    
    if (!currentUser.is_active) {
        return next(new ApiError(403, 'Forbidden: Akun Anda non-aktif'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };