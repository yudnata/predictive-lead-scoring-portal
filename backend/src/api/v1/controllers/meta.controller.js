const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

/**
 * Fungsi helper generik untuk mengambil data dari tabel master
 * @param {string} tableName - Nama tabel (e.g., 'tb_job')
 */
const getMetaData = async (tableName) => {
  const { rows } = await db.query(`SELECT * FROM ${tableName}`);
  return rows;
};

// Fungsi helper untuk membuat controller
const createMetaController = (tableName) => {
  return async (req, res, next) => {
    try {
      const data = await getMetaData(tableName);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      // Tangani jika nama tabel salah (meskipun ini error internal)
      next(new ApiError(500, `Gagal mengambil data dari ${tableName}`));
    }
  };
};

// Buat controllernya
exports.getJobs = createMetaController('tb_job');
exports.getMaritalStatus = createMetaController('tb_marital');
exports.getEducationLevels = createMetaController('tb_education');
exports.getPOutcomes = createMetaController('tb_poutcome');
exports.getStatuses = createMetaController('tb_status');
exports.getContactMethods = createMetaController('tb_contactmethod');