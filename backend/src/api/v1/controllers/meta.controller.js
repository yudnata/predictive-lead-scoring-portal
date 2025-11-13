// Kerangka untuk data master (dropdown)
const db = require('../../../config/database');

const getMasterData = (tableName) => async (req, res, next) => {
  try {
    // Hati-hati dengan SQL Injection, pastikan tableName di-whitelist
    const allowedTables = ['tb_job', 'tb_marital', 'tb_education', 'tb_status'];
    if (!allowedTables.includes(tableName)) {
      throw new Error('Invalid table');
    }
    
    const { rows } = await db.query(`SELECT * FROM ${tableName}`);
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getJobs = getMasterData('tb_job');
exports.getMaritalStatus = getMasterData('tb_marital');
exports.getEducationLevels = getMasterData('tb_education');
exports.getStatuses = getMasterData('tb_status');