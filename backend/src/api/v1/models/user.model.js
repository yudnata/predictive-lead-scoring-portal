const db = require('../../../config/database');

/**
 * Cari user berdasarkan email.
 * JOIN dengan tb_roles untuk mendapatkan role_name.
 */
const findByEmail = async (email) => {
  const query = {
    text: `
      SELECT u.*, r.role_name 
      FROM tb_users u
      JOIN tb_roles r ON u.roles_id = r.role_id
      WHERE u.user_email = $1
    `,
    values: [email],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * Cari user berdasarkan ID.
 * (Digunakan oleh middleware 'protect')
 */
const findById = async (userId) => {
  const query = {
    text: `
      SELECT u.*, r.role_name 
      FROM tb_users u
      JOIN tb_roles r ON u.roles_id = r.role_id
      WHERE u.user_id = $1
    `,
    values: [userId],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// (Fungsi lain seperti create, update, delete, findAll akan ditambahkan di sini nanti)

module.exports = {
  findByEmail,
  findById,
};