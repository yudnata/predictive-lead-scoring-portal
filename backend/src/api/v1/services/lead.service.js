/* eslint-disable camelcase */
const axios = require('axios');
const leadModel = require('../models/lead.model');
const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

const createLead = async (leadData, detailData) => {
  if (!leadData || !leadData.lead_name || !leadData.lead_email) {
    throw new ApiError(400, 'lead_name and lead_email are required');
  }

  let predictedScore = 0.0;

  try {
    let jobName = 'unknown';
    let maritalStatus = 'unknown';
    let educationLevel = 'unknown';
    let poutcomeName = 'unknown';

    if (leadData.job_id) {
      const jobResult = await db.query('SELECT job_name FROM tb_job WHERE job_id = $1', [
        leadData.job_id,
      ]);
      if (jobResult.rows.length > 0) {
        jobName = jobResult.rows[0].job_name.toLowerCase();
      }
    }

    if (leadData.marital_id) {
      const maritalResult = await db.query(
        'SELECT marital_status FROM tb_marital WHERE marital_id = $1',
        [leadData.marital_id]
      );
      if (maritalResult.rows.length > 0) {
        maritalStatus = maritalResult.rows[0].marital_status.toLowerCase();
      }
    }

    if (leadData.education_id) {
      const educationResult = await db.query(
        'SELECT education_level FROM tb_education WHERE education_id = $1',
        [leadData.education_id]
      );
      if (educationResult.rows.length > 0) {
        educationLevel = educationResult.rows[0].education_level.toLowerCase();
      }
    }


    if (detailData?.poutcome_id) {
      const poutcomeResult = await db.query(
        'SELECT poutcome_name FROM tb_poutcome WHERE poutcome_id = $1',
        [detailData.poutcome_id]
      );
      if (poutcomeResult.rows.length > 0) {
        poutcomeName = poutcomeResult.rows[0].poutcome_name.toLowerCase();
      }
    }

    let contactMethod = 'unknown';
    if (detailData?.contactmethod_id) {
      const contactResult = await db.query(
        'SELECT contact_method_name FROM tb_contact_method WHERE contactmethod_id = $1',
        [detailData.contactmethod_id]
      );
      if (contactResult.rows.length > 0) {
        contactMethod = contactResult.rows[0].contact_method_name.toLowerCase();
      }
    }

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthId = detailData?.month_id || 1;
    const monthName = monthNames[monthId - 1] || 'jan';

    const predictionData = {
      age: leadData.lead_age || 30,
      job: jobName,
      marital: maritalStatus,
      education: educationLevel,
      default: detailData?.lead_default === true || detailData?.lead_default === 1 ? 'yes' : 'no',
      balance: detailData?.lead_balance || 0,
      housing: detailData?.lead_housing_loan === true || detailData?.lead_housing_loan === 1 ? 'yes' : 'no',
      loan: detailData?.lead_loan === true || detailData?.lead_loan === 1 ? 'yes' : 'no',
      contact: contactMethod,
      day: detailData?.last_contact_day || 1,
      month: monthName,
      duration: detailData?.last_contact_duration_sec || 0,
      campaign: detailData?.campaign_count || 0,
      pdays: detailData?.pdays !== undefined ? detailData.pdays : 999,
      previous: detailData?.prev_contact_count || 0,
      poutcome: poutcomeName,
    };

    console.log('[ML Prediction] Calling ML API for single lead prediction...');
    console.log('[ML Prediction] Data sent:', JSON.stringify(predictionData, null, 2));

    const mlResponse = await axios.post(
      'http://localhost:5001/predict_single',
      predictionData,
      { timeout: 10000 }
    );

    if (mlResponse.data && mlResponse.data.prediction !== undefined) {
      predictedScore = parseFloat(mlResponse.data.prediction);
      console.log(`[ML Prediction] Score predicted: ${predictedScore}`);
    } else {
      console.warn('[ML Prediction] No prediction returned, using default score 0.0');
    }
  } catch (error) {
    console.error('[ML Prediction] Error calling ML API:', error.message);
    console.warn('[ML Prediction] Using default score 0.0 due to ML API error');
  }

  return leadModel.create(leadData, detailData, predictedScore);
};

const createLeadWithScore = async (leadData, detailData, score) => {
  if (!leadData.lead_name) leadData.lead_name = 'Unknown';
  if (!leadData.lead_email) leadData.lead_email = `noemail+${Date.now()}@example.com`;
  return leadModel.create(leadData, detailData, score || 0.0);
};

const bulkInsertWithScore = async (leads) => {
  const client = await db.connect();

  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  try {
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      try {
        const leadQuery = {
          text: `
            INSERT INTO tb_leads (lead_name, lead_phone_number, lead_email, lead_age, job_id, marital_id, education_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING lead_id
          `,
          values: [
            lead.lead_name,
            lead.lead_phone_number,
            lead.lead_email,
            lead.lead_age,
            lead.job_id,
            lead.marital_id,
            lead.education_id,
          ],
        };
        const { rows } = await client.query(leadQuery);
        const newLeadId = rows[0].lead_id;

        const detailQuery = {
          text: `
            INSERT INTO tb_leads_detail (
              lead_id, lead_default, lead_balance, lead_housing_loan, lead_loan,
              last_contact_day, month_id, last_contact_duration_sec,
              campaign_count, pdays, prev_contact_count,
              poutcome_id, contactmethod_id, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
            )
          `,
          values: [
            newLeadId,
            lead.lead_default,
            lead.lead_balance,
            lead.lead_housing_loan,
            lead.lead_loan,
            lead.last_contact_day,
            lead.month_id,
            lead.last_contact_duration_sec,
            lead.campaign_count,
            lead.pdays,
            lead.prev_contact_count,
            lead.poutcome_id,
            lead.contactmethod_id,
          ],
        };
        await client.query(detailQuery);

        const scoreQuery = {
          text: `INSERT INTO tb_leads_score (lead_id, lead_score, predicted_at) VALUES ($1, $2, NOW())`,
          values: [newLeadId, lead.lead_score],
        };
        await client.query(scoreQuery);

        successCount++;

        if (successCount % 100 === 0) {
          console.log(`✅ [DB Insert] Progress: ${successCount} data tersimpan...`);
        }
      } catch (err) {
        console.error(`❌ Gagal insert baris ke-${i + 1} (${lead.lead_email}):`, err.message);

        failureCount++;
        errors.push(`Baris ${i + 1}: ${err.message}`);
      }
    }

    return { successCount, failureCount, errors };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const queryLeads = async (queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';

  const minScore = queryOptions.minScore;
  const maxScore = queryOptions.maxScore;
  const jobId = queryOptions.jobId;
  const maritalId = queryOptions.maritalId;
  const educationId = queryOptions.educationId;
  const crmStatus = queryOptions.crmStatus;

  const options = {
    limit,
    offset,
    search,
    minScore,
    maxScore,
    jobId,
    maritalId,
    educationId,
    crmStatus,
  };

  const data = await leadModel.findAll(options);
  const total = await leadModel.countAll(options);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getLeadById = async (leadId) => {
  const lead = await leadModel.findFullLeadById(leadId);
  if (!lead) throw new ApiError(404, 'Lead not found');
  return lead;
};

const updateLeadById = async (leadId, leadData, detailData) => {
  await getLeadById(leadId);
  return leadModel.update(leadId, leadData, detailData);
};

const deleteLeadById = async (leadId) => {
  await getLeadById(leadId);
  return leadModel.deleteById(leadId);
};

const getCampaignsByLeadId = async (leadId) => {
  const query = `
    SELECT * FROM (
      SELECT DISTINCT ON (campaign_id)
        campaign_id,
        campaign_name,
        campaign_desc,
        status_id,
        status,
        updated_at
      FROM (
        SELECT 
          c.campaign_id,
          c.campaign_name,
          c.campaign_desc,
          cl.status_id,
          s.status,
          cl.updated_at
        FROM tb_campaign_leads cl
        INNER JOIN tb_campaigns c ON cl.campaign_id = c.campaign_id
        LEFT JOIN tb_status s ON cl.status_id = s.status_id
        WHERE cl.lead_id = $1

        UNION

        SELECT 
          c.campaign_id,
          c.campaign_name,
          c.campaign_desc,
          h.status_id,
          s.status,
          h.changed_at as updated_at
        FROM tb_lead_status_history h
        INNER JOIN tb_campaigns c ON h.campaign_id = c.campaign_id
        LEFT JOIN tb_status s ON h.status_id = s.status_id
        WHERE h.lead_id = $1
      ) AS combined_history
      ORDER BY campaign_id, updated_at DESC
    ) AS unique_history
    ORDER BY updated_at DESC
  `;
  const { rows } = await db.query(query, [leadId]);
  return rows;
};

const batchDeleteLeads = async (leadIds) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const placeholders = leadIds.map((_, idx) => `$${idx + 1}`).join(', ');
    const query = `DELETE FROM tb_leads WHERE lead_id IN (${placeholders})`;
    const result = await client.query(query, leadIds);

    await client.query('COMMIT');
    return { deletedCount: result.rowCount };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createLead,
  createLeadWithScore,
  bulkInsertWithScore,
  queryLeads,
  getLeadById,
  updateLeadById,
  deleteLeadById,
  getCampaignsByLeadId,
  batchDeleteLeads,
};
