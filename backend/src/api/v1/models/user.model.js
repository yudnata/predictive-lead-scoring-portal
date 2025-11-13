const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

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

/**
 * Membuat user baru (sales atau admin)
 * @param {object} userData
 * @returns {Promise<object>} User yang baru dibuat
 */
const create = async (userData) => {
  const {
    roles_id,
    user_email,
    password,
    full_name,
    address,
    country,
    is_active,
  } = userData;

  const query = {
    text: `
      INSERT INTO tb_users
        (roles_id, user_email, password, full_name, address, country, is_active, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `,
    values: [
      roles_id,
      user_email,
      password,
      full_name,
      address || null,
      country || null,
      is_active,
    ],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * Mencari semua user 'sales' dengan pagination dan search
 * @param {object} options - { limit, offset, search }
 * @returns {Promise<Array>} Daftar user sales (tanpa password)
 */
const findAllSales = async (options) => {
  const { limit, offset, search } = options;
  let queryText = `
    SELECT u.user_id, u.full_name, u.user_email, u.is_active, u.created_at, r.role_name 
    FROM tb_users u
    JOIN tb_roles r ON u.roles_id = r.role_id
    WHERE r.role_name = 'sales'
  `;
  const queryValues = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (u.full_name ILIKE $${paramIndex++} OR u.user_email ILIKE $${paramIndex++})`;
    queryValues.push(`%${search}%`, `%${search}%`);
  }

  queryText += ` ORDER BY u.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

/**
 * Menghitung total user 'sales'
 * @param {object} options - { search }
 * @returns {Promise<number>} Jumlah total user sales
 */
const countAllSales = async (options) => {
  const { search } = options;
  let queryText = `
    SELECT COUNT(u.user_id) 
    FROM tb_users u
    JOIN tb_roles r ON u.roles_id = r.role_id
    WHERE r.role_name = 'sales'
  `;
  const queryValues = [];

  if (search) {
    queryText += ' AND (u.full_name ILIKE $1 OR u.user_email ILIKE $1)';
    queryValues.push(`%${search}%`);
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

/**
 * Meng-update user berdasarkan ID
 * @param {number} userId
 * @param {object} userData - Data yang akan di-update
 * @returns {Promise<object>} User yang sudah di-update
 */
const update = async (userId, userData) => {
  // Ambil data user saat ini
  const currentUser = await findById(userId);
  if (!currentUser) {
    throw new ApiError(404, 'User tidak ditemukan');
  }

  // Gabungkan data lama dengan data baru
  const {
    full_name = currentUser.full_name,
    user_email = currentUser.user_email,
    address = currentUser.address,
    country = currentUser.country,
    is_active = currentUser.is_active,
  } = userData;

  const query = {
    text: `
      UPDATE tb_users
      SET 
        full_name = $1,
        user_email = $2,
        address = $3,
        country = $4,
        is_active = $5
      WHERE user_id = $6
      RETURNING *
    `,
    values: [full_name, user_email, address, country, is_active, userId],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * Menghapus user berdasarkan ID
 * @param {number} userId
 * @returns {Promise<void>}
 */
const deleteById = async (userId) => {
  const { rowCount } = await db.query(
    'DELETE FROM tb_users WHERE user_id = $1',
    [userId]
  );
  if (rowCount === 0) {
    throw new ApiError(404, 'User tidak ditemukan');
  }
};

module.exports = {
  findByEmail,
  findById,
  create,
  findAllSales,
  countAllSales,
  update,
  deleteById,
};