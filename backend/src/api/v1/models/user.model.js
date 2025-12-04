const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

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

const create = async (userData) => {
  const { roles_id, user_email, password, full_name, address, country, is_active } = userData;

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

const findAllSales = async (options) => {
  const { limit, offset, search, isActive, minLeadsHandled, maxLeadsHandled } = options;
  let queryText = `
    SELECT
      u.user_id,
      u.full_name,
      u.user_email,
      u.is_active,
      u.created_at,
      r.role_name,
      COALESCE(
        (
          SELECT COUNT(ca.campaign_id)
          FROM tb_campaign_assignments ca
          JOIN tb_campaigns c ON ca.campaign_id = c.campaign_id
          WHERE ca.user_id = u.user_id AND c.campaign_is_active = TRUE
        )
      , 0) AS active_campaigns,
      (SELECT COUNT(*) FROM tb_campaign_leads cl WHERE cl.user_id = u.user_id) as leads_handled

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

  if (isActive !== undefined && isActive !== '') {
    queryText += ` AND u.is_active = $${paramIndex++}`;
    queryValues.push(isActive === 'true');
  }

  if (minLeadsHandled) {
    queryText += ` AND (SELECT COUNT(*) FROM tb_campaign_leads cl WHERE cl.user_id = u.user_id) >= $${paramIndex++}`;
    queryValues.push(parseInt(minLeadsHandled, 10));
  }

  if (maxLeadsHandled) {
    queryText += ` AND (SELECT COUNT(*) FROM tb_campaign_leads cl WHERE cl.user_id = u.user_id) <= $${paramIndex++}`;
    queryValues.push(parseInt(maxLeadsHandled, 10));
  }

  queryText += ` ORDER BY u.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

const countAllSales = async (options) => {
  const { search, isActive, minLeadsHandled, maxLeadsHandled } = options;
  let queryText = `
    SELECT COUNT(u.user_id)
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

  if (isActive !== undefined && isActive !== '') {
    queryText += ` AND u.is_active = $${paramIndex++}`;
    queryValues.push(isActive === 'true');
  }

  if (minLeadsHandled) {
    queryText += ` AND (SELECT COUNT(*) FROM tb_campaign_leads cl WHERE cl.user_id = u.user_id) >= $${paramIndex++}`;
    queryValues.push(parseInt(minLeadsHandled, 10));
  }

  if (maxLeadsHandled) {
    queryText += ` AND (SELECT COUNT(*) FROM tb_campaign_leads cl WHERE cl.user_id = u.user_id) <= $${paramIndex++}`;
    queryValues.push(parseInt(maxLeadsHandled, 10));
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

const update = async (userId, userData) => {
  const currentUser = await findById(userId);
  if (!currentUser) {
    throw new ApiError(404, 'User tidak ditemukan');
  }
  const {
    full_name = currentUser.full_name,
    user_email = currentUser.user_email,
    address = currentUser.address,
    country = currentUser.country,
    is_active = currentUser.is_active,
    password = currentUser.password,
  } = userData;

  const query = {
    text: `
      UPDATE tb_users
      SET
        full_name = $1,
        user_email = $2,
        address = $3,
        country = $4,
        is_active = $5,
        password = $6
      WHERE user_id = $7
      RETURNING *
    `,
    values: [full_name, user_email, address, country, is_active, password, userId],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

const deleteById = async (userId) => {
  const { rowCount } = await db.query('DELETE FROM tb_users WHERE user_id = $1', [userId]);
  if (rowCount === 0) {
    throw new ApiError(404, 'User tidak ditemukan');
  }
};

const assignCampaigns = async (userId, campaignIds) => {
  if (!campaignIds || campaignIds.length === 0) return;

  const values = campaignIds.map((id, index) => `($1, $${index + 2}, NOW())`).join(', ');
  const queryText = `
    INSERT INTO tb_campaign_assignments (user_id, campaign_id, assigned_at)
    VALUES ${values}
    ON CONFLICT DO NOTHING
  `;

  await db.query(queryText, [userId, ...campaignIds]);
};

const deleteAssignments = async (userId) => {
  await db.query('DELETE FROM tb_campaign_assignments WHERE user_id = $1', [userId]);
};

const getAssignments = async (userId) => {
  const { rows } = await db.query(
    'SELECT campaign_id FROM tb_campaign_assignments WHERE user_id = $1',
    [userId]
  );
  return rows.map((r) => r.campaign_id);
};

module.exports = {
  findByEmail,
  findById,
  create,
  findAllSales,
  countAllSales,
  update,
  deleteById,
  assignCampaigns,
  deleteAssignments,
  getAssignments,
};
