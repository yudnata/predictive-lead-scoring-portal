const leadModel = require('../models/lead.model');
const ApiError = require('../utils/apiError');

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
};