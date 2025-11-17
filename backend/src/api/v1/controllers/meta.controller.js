const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

const getMetaData = async (tableName) => {
  const { rows } = await db.query(`SELECT * FROM ${tableName}`);
  return rows;
};

const createMetaController = (tableName) => {
  return async (req, res, next) => {
    try {
      const data = await getMetaData(tableName);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(new ApiError(500, `Gagal mengambil data dari ${tableName}`));
    }
  };
};

exports.getJobs = createMetaController('tb_job');
exports.getMaritalStatus = createMetaController('tb_marital');
exports.getEducationLevels = createMetaController('tb_education');
exports.getPoutcomes = createMetaController('tb_poutcome');
exports.getStatuses = createMetaController('tb_status');
exports.getContactMethods = createMetaController('tb_contact_method');