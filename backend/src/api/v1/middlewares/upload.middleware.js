const multer = require('multer');
const ApiError = require('../utils/apiError');

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/csv'];

const fileFilter = (req, file, cb) => {
  const isValidExtension = file.originalname.toLowerCase().endsWith('.csv');
  const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (isValidExtension && isValidMimeType) {
    cb(null, true);
  } else {
    const error = new ApiError(
      400,
      'Invalid file type. Only CSV files are allowed (.csv extension with valid MIME type).'
    );
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
