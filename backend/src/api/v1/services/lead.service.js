const leadModel = require('../models/lead.model');
const ApiError = require('../utils/apiError');
const csv = require('fast-csv');
const { Readable } = require('stream');
const createLead = async (leadData, detailData) => {
  if (!leadData.lead_name || !leadData.lead_email) {
    throw new ApiError(400, 'Nama dan Email lead harus diisi');
  }
  return leadModel.create(leadData, detailData);
};

const bulkCreateLeadsFromCSV = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const leads = [];

    const stream = Readable.from(fileBuffer);

    const csvStream = csv
      .parse({ headers: true })
      .on('error', (error) => {
        reject(new ApiError(400, `Format CSV tidak valid: ${error.message}`));
      })
      .on('data', (row) => {
        leads.push(row);
      })
      .on('end', async (rowCount) => {
        if (leads.length === 0) {
          return reject(new ApiError(400, 'File CSV kosong atau tidak ada data'));
        }

        try {
          const result = await leadModel.bulkInsert(leads);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

    stream.pipe(csvStream);
  });
};

const queryLeads = async (queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';

  const options = { limit, offset, search };

  const leads = await leadModel.findAll(options);
  const totalLeads = await leadModel.countAll(options);
  const totalPages = Math.ceil(totalLeads / limit);

  return {
    data: leads,
    meta: {
      total: totalLeads,
      page,
      limit,
      totalPages,
    },
  };
};

const getLeadById = async (leadId) => {
  const lead = await leadModel.findFullLeadById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead tidak ditemukan');
  }
  return lead;
};

const updateLeadById = async (leadId, leadData, detailData) => {
  await getLeadById(leadId);

  if (
    (!leadData || Object.keys(leadData).length === 0) &&
    (!detailData || Object.keys(detailData).length === 0)
  ) {
    throw new ApiError(400, 'Tidak ada data yang diupdate');
  }

  return leadModel.update(leadId, leadData, detailData);
};

const deleteLeadById = async (leadId) => {
  await getLeadById(leadId);
  await leadModel.deleteById(leadId);
};

module.exports = {
  createLead,
  queryLeads,
  getLeadById,
  updateLeadById,
  deleteLeadById,
  bulkCreateLeadsFromCSV
};
