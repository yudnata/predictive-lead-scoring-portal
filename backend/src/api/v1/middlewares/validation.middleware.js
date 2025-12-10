const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(new ApiError(400, errorMessages.join(', ')));
  }
  next();
};

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail().trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const createLeadValidation = [
  body('lead_name')
    .optional()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ max: 100 })
    .withMessage('Lead name must be at most 100 characters')
    .trim(),
  body('leadData.lead_name')
    .optional()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ max: 100 })
    .withMessage('Lead name must be at most 100 characters')
    .trim(),
  body('lead_email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('leadData.lead_email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('lead_phone_number')
    .optional({ nullable: true })
    .isLength({ max: 20 })
    .withMessage('Phone number must be at most 20 characters'),
  body('leadData.lead_phone_number')
    .optional({ nullable: true })
    .isLength({ max: 20 })
    .withMessage('Phone number must be at most 20 characters'),
  body('lead_age')
    .optional({ nullable: true })
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120'),
  body('leadData.lead_age')
    .optional({ nullable: true })
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120'),
  (req, res, next) => {
    const hasDirectName = req.body.lead_name;
    const hasStructuredName = req.body.leadData && req.body.leadData.lead_name;

    if (!hasDirectName && !hasStructuredName) {
      return next(new ApiError(400, 'Lead name is required'));
    }
    next();
  },
  handleValidationErrors,
];

const updateLeadValidation = [
  param('leadId').isInt({ min: 1 }).withMessage('Invalid lead ID'),
  body('leadData.lead_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Lead name must be at most 100 characters')
    .trim(),
  body('leadData.lead_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('leadData.lead_age')
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120'),
  handleValidationErrors,
];

const createUserValidation = [
  body('user_email').isEmail().withMessage('Invalid email format').normalizeEmail().trim(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name must be at most 100 characters')
    .trim(),
  body('roles_id').optional().isInt({ min: 1 }).withMessage('Invalid role ID'),
  handleValidationErrors,
];

const createCampaignValidation = [
  body('campaign_name')
    .notEmpty()
    .withMessage('Campaign name is required')
    .isLength({ max: 100 })
    .withMessage('Campaign name must be at most 100 characters')
    .trim(),
  body('campaign_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters')
    .trim(),
  body('target_audience')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Target audience must be at most 200 characters')
    .trim(),
  handleValidationErrors,
];

const queryPaginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query must be at most 100 characters')
    .trim(),
  handleValidationErrors,
];

const idParamValidation = [
  param('leadId').optional().isInt({ min: 1 }).withMessage('Invalid lead ID'),
  param('campaignId').optional().isInt({ min: 1 }).withMessage('Invalid campaign ID'),
  param('userId').optional().isInt({ min: 1 }).withMessage('Invalid user ID'),
  handleValidationErrors,
];

const batchDeleteValidation = [
  body('leadIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('leadIds must be an array with 1-100 items'),
  body('leadIds.*').isInt({ min: 1 }).withMessage('Each lead ID must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  loginValidation,
  createLeadValidation,
  updateLeadValidation,
  createUserValidation,
  createCampaignValidation,
  queryPaginationValidation,
  idParamValidation,
  batchDeleteValidation,
};
