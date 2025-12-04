const ApiError = require('../utils/apiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role_name)) {
      return next(
        new ApiError(403, 'Forbidden: Anda tidak memiliki hak akses untuk sumber daya ini')
      );
    }
    next();
  };
};

module.exports = { authorize };
