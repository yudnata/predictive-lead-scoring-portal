const ApiError = require('../utils/apiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role_name)) {
      return next(new ApiError(403, 'Forbidden: You do not have access to this resource'));
    }
    next();
  };
};

module.exports = { authorize };
