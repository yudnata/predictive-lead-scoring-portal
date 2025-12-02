/* eslint-disable camelcase */
const axios = require('axios');
const leadModel = require('../models/lead.model');
const db = require('../../../config/database');
const ApiError = require('../utils/apiError');

const createLead = async (leadData, detailData) => {
  if (!leadData || !leadData.lead_name || !leadData.lead_email) {
    throw new ApiError(400, 'lead_name dan lead_email wajib diisi');
  }

  let predictedScore = 0.0;
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
              poutcome_id, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()
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

  const options = { limit, offset, search };

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
  if (!lead) throw new ApiError(404, 'Lead tidak ditemukan');
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
    ORDER BY cl.updated_at DESC
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
