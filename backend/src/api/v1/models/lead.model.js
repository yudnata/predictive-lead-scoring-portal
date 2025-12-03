/* eslint-disable camelcase */
const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

/**
 * insertSingleLeadWithClient
 * - digunakan oleh bulk insert dalam satu client (transaksi)
 * - expect lead object contains lead fields and detail fields already mapped
 */
const insertSingleLeadWithClient = async (client, lead) => {
  const {
    lead_name,
    lead_phone_number,
    lead_email,
    lead_age,
    job_id,
    marital_id,
    education_id,
    // detail fields
    lead_default,
    lead_balance,
    lead_housing_loan,
    lead_loan,
    last_contact_day,
    month_id,
    last_contact_duration_sec,
    campaign_count,
    pdays,
    prev_contact_count,
    poutcome_id,
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
      INSERT INTO tb_leads_detail (
        lead_id, lead_default, lead_balance, lead_housing_loan, lead_loan,
        last_contact_day, month_id, last_contact_duration_sec,
        campaign_count, pdays, prev_contact_count,
        poutcome_id, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()
      )
    `,
    values: [
      newLeadId,
      lead_default === true, // boolean
      lead_balance !== undefined ? lead_balance : null,
      lead_housing_loan === true,
      lead_loan === true,
      last_contact_day !== undefined ? last_contact_day : null,
      month_id !== undefined ? month_id : null,
      last_contact_duration_sec !== undefined ? last_contact_duration_sec : null,
      campaign_count !== undefined ? campaign_count : null,
      pdays !== undefined ? pdays : null,
      prev_contact_count !== undefined ? prev_contact_count : null,
      poutcome_id !== undefined ? poutcome_id : null,
    ],
  };

  await client.query(detailQuery);

  const scoreQuery = {
    text: `INSERT INTO tb_leads_score (lead_id, lead_score, predicted_at) VALUES ($1, $2, NOW())`,
    values: [newLeadId, 0.0],
  };
  await client.query(scoreQuery);

  return newLeadId;
};

const fullLeadQuery = `
  SELECT
    l.lead_id, 
    l.lead_name, 
    l.lead_phone_number, 
    l.lead_email, 
    l.lead_age, 
    l.created_at, 
    l.updated_at,

    j.job_id, 
    j.job_name,

    m.marital_id, 
    m.marital_status,

    e.education_id, 
    e.education_level,

    d.leads_detail_id, 
    d.lead_balance, 
    d.lead_housing_loan, 
    d.lead_loan, 
    d.poutcome_id,

    po.poutcome_name,

    ls.lead_score,

    CASE 
      WHEN EXISTS (
        SELECT 1 FROM tb_campaign_leads cl WHERE cl.lead_id = l.lead_id
      ) THEN 'Tracked'
      ELSE 'Available'
    END as crm_status

  FROM tb_leads l
  LEFT JOIN tb_job j ON l.job_id = j.job_id
  LEFT JOIN tb_marital m ON l.marital_id = m.marital_id
  LEFT JOIN tb_education e ON l.education_id = e.education_id
  LEFT JOIN tb_leads_detail d ON l.lead_id = d.lead_id
  LEFT JOIN tb_poutcome po ON d.poutcome_id = po.poutcome_id
  LEFT JOIN tb_leads_score ls ON l.lead_id = ls.lead_id
`;

const create = async (leadData, detailData, score = 0.0) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const leadQuery = {
      text: `
        INSERT INTO tb_leads (lead_name, lead_phone_number, lead_email, lead_age, job_id, marital_id, education_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING lead_id
      `,
      values: [
        leadData.lead_name,
        leadData.lead_phone_number || null,
        leadData.lead_email || null,
        leadData.lead_age || null,
        leadData.job_id || null,
        leadData.marital_id || null,
        leadData.education_id || null,
      ],
    };

    const { rows: leadRows } = await client.query(leadQuery);
    const newLeadId = leadRows[0].lead_id;

    const detailQuery = {
      text: `
        INSERT INTO tb_leads_detail (
          lead_id, lead_default, lead_balance, lead_housing_loan, lead_loan,
          last_contact_day, month_id, last_contact_duration_sec,
          campaign_count, pdays, prev_contact_count,
          poutcome_id, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()
        )
      `,
      values: [
        newLeadId,
        detailData && detailData.lead_default === true,
        detailData && detailData.lead_balance !== undefined ? detailData.lead_balance : null,
        detailData && detailData.lead_housing_loan === true,
        detailData && detailData.lead_loan === true,
        detailData && detailData.last_contact_day !== undefined
          ? detailData.last_contact_day
          : null,
        detailData && detailData.month_id !== undefined ? detailData.month_id : null,
        detailData && detailData.last_contact_duration_sec !== undefined
          ? detailData.last_contact_duration_sec
          : null,
        detailData && detailData.campaign_count !== undefined ? detailData.campaign_count : null,
        detailData && detailData.pdays !== undefined ? detailData.pdays : null,
        detailData && detailData.prev_contact_count !== undefined
          ? detailData.prev_contact_count
          : null,
        detailData && detailData.poutcome_id !== undefined ? detailData.poutcome_id : null,
      ],
    };

    await client.query(detailQuery);

    const scoreQuery = {
      text: `INSERT INTO tb_leads_score (lead_id, lead_score, predicted_at) VALUES ($1, $2, NOW())`,
      values: [newLeadId, score],
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
  const { 
    limit = 10, 
    offset = 0, 
    search = '',
    minScore,
    maxScore,
    jobId,
    maritalId,
    educationId
  } = options;

  let queryText = fullLeadQuery;
  const queryValues = [];
  let idx = 1;
  const conditions = [];

  if (search) {
    conditions.push(`(l.lead_name ILIKE $${idx} OR l.lead_email ILIKE $${idx})`);
    queryValues.push(`%${search}%`);
    idx++;
  }

  if (minScore !== undefined) {
    conditions.push(`ls.lead_score >= $${idx}`);
    queryValues.push(parseFloat(minScore));
    idx++;
  }

  if (maxScore !== undefined) {
    conditions.push(`ls.lead_score <= $${idx}`);
    queryValues.push(parseFloat(maxScore));
    idx++;
  }

  if (jobId) {
    conditions.push(`l.job_id = $${idx}`);
    queryValues.push(parseInt(jobId));
    idx++;
  }

  if (maritalId) {
    conditions.push(`l.marital_id = $${idx}`);
    queryValues.push(parseInt(maritalId));
    idx++;
  }

  if (educationId) {
    conditions.push(`l.education_id = $${idx}`);
    queryValues.push(parseInt(educationId));
    idx++;
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ` ORDER BY ls.lead_score DESC NULLS LAST, l.created_at DESC LIMIT $${idx} OFFSET $${
    idx + 1
  }`;
  queryValues.push(limit, offset);

  const { rows } = await db.query(queryText, queryValues);
  return rows;
};

const countAll = async (options) => {
  const { 
    search = '',
    minScore,
    maxScore,
    jobId,
    maritalId,
    educationId
  } = options;

  let queryText = `
    SELECT COUNT(l.lead_id) AS count 
    FROM tb_leads l
    LEFT JOIN tb_leads_score ls ON l.lead_id = ls.lead_id
  `;
  
  const queryValues = [];
  let idx = 1;
  const conditions = [];

  if (search) {
    conditions.push(`(l.lead_name ILIKE $${idx} OR l.lead_email ILIKE $${idx})`);
    queryValues.push(`%${search}%`);
    idx++;
  }

  if (minScore !== undefined) {
    conditions.push(`ls.lead_score >= $${idx}`);
    queryValues.push(parseFloat(minScore));
    idx++;
  }

  if (maxScore !== undefined) {
    conditions.push(`ls.lead_score <= $${idx}`);
    queryValues.push(parseFloat(maxScore));
    idx++;
  }

  if (jobId) {
    conditions.push(`l.job_id = $${idx}`);
    queryValues.push(parseInt(jobId));
    idx++;
  }

  if (maritalId) {
    conditions.push(`l.marital_id = $${idx}`);
    queryValues.push(parseInt(maritalId));
    idx++;
  }

  if (educationId) {
    conditions.push(`l.education_id = $${idx}`);
    queryValues.push(parseInt(educationId));
    idx++;
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
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
      const fields = Object.keys(leadData);
      const values = Object.values(leadData);
      const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const q = {
        text: `UPDATE tb_leads SET ${set}, updated_at = NOW() WHERE lead_id = $${
          fields.length + 1
        }`,
        values: [...values, leadId],
      };
      await client.query(q);
    }

    if (detailData && Object.keys(detailData).length > 0) {
      const fields = Object.keys(detailData);
      const values = Object.values(detailData);
      const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const q = {
        text: `UPDATE tb_leads_detail SET ${set}, updated_at = NOW() WHERE lead_id = $${
          fields.length + 1
        }`,
        values: [...values, leadId],
      };
      await client.query(q);
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

    for (let i = 0; i < leads.length; i++) {
      try {
        const id = await insertSingleLeadWithClient(client, leads[i]);
        successCount++;
      } catch (err) {
        failureCount++;
        errors.push(`Baris ${i + 1}: ${err.message || err.detail || 'Unknown error'}`);
      }
    }

    if (failureCount > 0) {
      await client.query('ROLLBACK');
      throw new ApiError(400, `${failureCount} dari ${leads.length} data gagal`, errors);
    }

    await client.query('COMMIT');
    return { totalRows: leads.length, successCount, failureCount, errors: [] };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, 'Gagal melakukan insert bulk', [err.message]);
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
