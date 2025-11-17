const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

const insertSingleLeadWithClient = async (client, lead) => {

  const {
    lead_name,
    lead_phone_number,
    lead_email,
    lead_age,
    job_id,
    marital_id,
    education_id,
    lead_balance,
    lead_housing_loan,
    lead_loan,
  } = lead;

  const leadQuery = {
    text: `
      INSERT INTO tb_leads (lead_name, lead_phone_number, lead_email, lead_age, job_id, marital_id, education_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING lead_id
    `,
    values: [
      lead_name,
      lead_phone_number || null,
      lead_email || null,
      lead_age || null,
      job_id || null,
      marital_id || null,
      education_id || null,
    ],
  };
  const { rows: leadRows } = await client.query(leadQuery);
  const newLeadId = leadRows[0].lead_id;

  const detailQuery = {
    text: `
      INSERT INTO tb_leads_detail (lead_id, lead_balance, lead_housing_loan, lead_loan, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
    `,
    values: [newLeadId, lead_balance || null, lead_housing_loan || false, lead_loan || false],
  };
  await client.query(detailQuery);

  // 3. Insert skor default
  const scoreQuery = {
    text: `INSERT INTO tb_leads_score (lead_id, lead_score, predicted_at) VALUES ($1, $2, NOW())`,
    values: [newLeadId, 0.0],
  };
  await client.query(scoreQuery);

  return newLeadId;
};

const fullLeadQuery = `
  SELECT
    l.lead_id, l.lead_name, l.lead_phone_number, l.lead_email, l.lead_age, l.created_at, l.updated_at,
    j.job_id, j.job_name,
    m.marital_id, m.marital_status,
    e.education_id, e.education_level,
    d.leads_detail_id, d.lead_balance, d.lead_housing_loan, d.lead_loan, d.poutcome_id,
    po.poutcome_name,
    ls.lead_score
  FROM tb_leads l
  LEFT JOIN tb_job j ON l.job_id = j.job_id
  LEFT JOIN tb_marital m ON l.marital_id = m.marital_id
  LEFT JOIN tb_education e ON l.education_id = e.education_id
  LEFT JOIN tb_leads_detail d ON l.lead_id = d.lead_id
  LEFT JOIN tb_poutcome po ON d.poutcome_id = po.poutcome_id
  LEFT JOIN tb_leads_score ls ON l.lead_id = ls.lead_id
  -- (Tambahkan 'WHERE ls.model_id = ...' jika ada model spesifik)
`;

const create = async (leadData, detailData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert ke tb_leads
    const leadQuery = {
      text: `
        INSERT INTO tb_leads (lead_name, lead_phone_number, lead_email, lead_age, job_id, marital_id, education_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING lead_id
      `,
      values: [
        leadData.lead_name,
        leadData.lead_phone_number,
        leadData.lead_email,
        leadData.lead_age,
        leadData.job_id,
        leadData.marital_id,
        leadData.education_id,
      ],
    };
    const { rows: leadRows } = await client.query(leadQuery);
    const newLeadId = leadRows[0].lead_id;

    // 2. Insert ke tb_leads_detail
    const detailQuery = {
      text: `
        INSERT INTO tb_leads_detail (lead_id, lead_balance, lead_housing_loan, lead_loan, poutcome_id, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      values: [
        newLeadId,
        detailData.lead_balance || null,
        detailData.lead_housing_loan || false,
        detailData.lead_loan || false,
        detailData.poutcome_id || null,
      ],
    };
    await client.query(detailQuery);

    const scoreQuery = {
      text: `INSERT INTO tb_leads_score (lead_id, lead_score, predicted_at) VALUES ($1, $2, NOW())`,
      values: [newLeadId, 0.0],
    };
    await client.query(scoreQuery);

    await client.query('COMMIT');

    return findFullLeadById(newLeadId);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505' && error.constraint === 'tb_leads_lead_email_key') {
      throw new ApiError(400, 'Email sudah terdaftar');
    }
    throw error;
  } finally {
    client.release();
  }
};

const findAll = async (options) => {
  const { limit, offset, search } = options;
  let queryText = fullLeadQuery.replace('FROM tb_leads l', 'FROM tb_leads l'); // Salin query
  const queryValues = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` WHERE l.lead_name ILIKE $${paramIndex++} OR l.lead_email ILIKE $${paramIndex++}`;
    queryValues.push(`%${search}%`, `%${search}%`);
  }

  queryText += ` ORDER BY ls.lead_score DESC, l.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

const countAll = async (options) => {
  const { search } = options;
  let queryText = 'SELECT COUNT(lead_id) FROM tb_leads';
  const queryValues = [];

  if (search) {
    queryText += ' WHERE lead_name ILIKE $1 OR lead_email ILIKE $1';
    queryValues.push(`%${search}%`);
  }

  const { rows } = await db.query(queryText, queryValues);
  return parseInt(rows[0].count, 10);
};

const findFullLeadById = async (leadId) => {
  const queryText = `${fullLeadQuery} WHERE l.lead_id = $1`;
  const { rows } = await db.query(queryText, [leadId]);
  return rows[0];
};

const update = async (leadId, leadData, detailData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    if (leadData && Object.keys(leadData).length > 0) {
      const leadFields = Object.keys(leadData);
      const leadValues = Object.values(leadData);

      const setClause = leadFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const leadQuery = {
        text: `UPDATE tb_leads SET ${setClause}, updated_at = NOW() WHERE lead_id = $${
          leadValues.length + 1
        }`,
        values: [...leadValues, leadId],
      };
      await client.query(leadQuery);
    }

    if (detailData && Object.keys(detailData).length > 0) {
      const detailFields = Object.keys(detailData);
      const detailValues = Object.values(detailData);

      const setClause = detailFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const detailQuery = {
        text: `UPDATE tb_leads_detail SET ${setClause}, updated_at = NOW() WHERE lead_id = $${
          detailValues.length + 1
        }`,
        values: [...detailValues, leadId],
      };
      await client.query(detailQuery);
    }

    await client.query('COMMIT');

    return findFullLeadById(leadId);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505' && error.constraint === 'tb_leads_lead_email_key') {
      throw new ApiError(400, 'Email sudah digunakan oleh lead lain');
    }
    throw error;
  } finally {
    client.release();
  }
};

const deleteById = async (leadId) => {
  const { rowCount } = await db.query('DELETE FROM tb_leads WHERE lead_id = $1', [leadId]);
  if (rowCount === 0) {
    throw new ApiError(404, 'Lead tidak ditemukan');
  }
};

const bulkInsert = async (leads) => {
  const client = await db.connect();
  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  try {
    await client.query('BEGIN');

    const results = await Promise.allSettled(
      leads.map((lead) => insertSingleLeadWithClient(client, lead))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else {
        failureCount++;
        errors.push(
          `Baris ${index + 2}: ${
            result.reason.message || result.reason.detail || 'Error tidak diketahui'
          }`
        );
      }
    });

    if (failureCount > 0) {
      await client.query('ROLLBACK');
      throw new ApiError(
        400,
        `Proses gagal. ${failureCount} dari ${leads.length} data bermasalah.`,
        errors
      );
    }

    await client.query('COMMIT');

    return {
      totalRows: leads.length,
      successCount,
      failureCount,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Transaksi database gagal', [error.message]);
  } finally {
    client.release();
  }
};

module.exports = {
  create,
  findAll,
  countAll,
  findFullLeadById,
  update,
  deleteById,
  bulkInsert,
};
