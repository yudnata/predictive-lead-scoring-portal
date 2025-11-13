const leadModel = require('../models/lead.model');
const ApiError = require('../utils/apiError');
const csv = require('fast-csv');
const { Readable } = require('stream');

/**
 * Membuat lead baru
 * @param {object} leadData - Data dari tb_leads
 * @param {object} detailData - Data dari tb_leads_detail
 * @returns {Promise<object>}
 */
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
        // Error parsing CSV
        reject(new ApiError(400, `Format CSV tidak valid: ${error.message}`));
      })
      .on('data', (row) => {
        // TODO: Transformasi data di sini jika perlu
        // Misal: Ubah 'TRUE'/'FALSE' (string) menjadi boolean
        // row.lead_housing_loan = row.lead_housing_loan.toLowerCase() === 'true';
        // row.lead_loan = row.lead_loan.toLowerCase() === 'true';
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
          // Tangkap error dari model (misal 400 jika semua gagal)
          reject(error);
        }
      });

    stream.pipe(csvStream);
  });
};

/**
 * Mengambil semua leads dengan pagination
 * @param {object} queryOptions - { page, limit, search }
 * @returns {Promise<object>}
 */
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

/**
 * Mengambil detail lead berdasarkan ID
 * @param {number} leadId
 * @returns {Promise<object>}
 */
const getLeadById = async (leadId) => {
  const lead = await leadModel.findFullLeadById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead tidak ditemukan');
  }
  return lead;
};

/**
 * Meng-update lead berdasarkan ID
 * @param {number} leadId
 * @param {object} leadData
 * @param {object} detailData
 * @returns {Promise<object>}
 */
const updateLeadById = async (leadId, leadData, detailData) => {
  // Cek dulu apakah lead-nya ada
  await getLeadById(leadId);

  if (
    (!leadData || Object.keys(leadData).length === 0) &&
    (!detailData || Object.keys(detailData).length === 0)
  ) {
    throw new ApiError(400, 'Tidak ada data yang diupdate');
  }

  return leadModel.update(leadId, leadData, detailData);
};

/**
 * Menghapus lead berdasarkan ID
 * @param {number} leadId
 * @returns {Promise<void>}
 */
const deleteLeadById = async (leadId) => {
  await getLeadById(leadId); // Cek apakah ada
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
