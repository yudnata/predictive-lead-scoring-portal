const multer = require('multer');
const ApiError = require('../utils/apiError');

// Konfigurasi penyimpanan di memori (buffer)
const storage = multer.memoryStorage();

// Filter file untuk hanya menerima .csv
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Tipe file tidak valid. Hanya file .csv yang diizinkan.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (sesuai UI)
  },
});

module.exports = upload;