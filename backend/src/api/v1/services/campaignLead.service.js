const campaignLeadModel = require('../models/campaignLead.model');
const historyModel = require('../models/history.model.js');
const leadModel = require('../models/lead.model');
const campaignModel = require('../models/campaign.model');
const ApiError = require('../utils/apiError');

/**
 * Logika untuk "Tautkan ke Campaign"
 */
const assignLeadToCampaign = async (userId, assignBody) => {
  const { lead_id, campaign_id, status_id } = assignBody;

  // 1. Validasi
  if (!lead_id || !campaign_id || !status_id) {
    throw new ApiError(400, 'lead_id, campaign_id, dan status_id harus diisi');
  }
  // Status awal tidak boleh Deal/Reject
  if (status_id === 3 || status_id === 4) {
    throw new ApiError(400, 'Status awal tidak boleh Deal atau Reject');
  }

  const lead = await leadModel.findFullLeadById(lead_id);
  if (!lead) throw new ApiError(404, 'Lead tidak ditemukan');
  
  const campaign = await campaignModel.findById(campaign_id);
  if (!campaign) throw new ApiError(404, 'Campaign tidak ditemukan');
  
  const existingLink = await campaignLeadModel.findByLeadAndCampaign(lead_id, campaign_id);
  if (existingLink) {
    throw new ApiError(400, 'Lead ini sudah ditautkan ke campaign tersebut');
  }

  // 4. Buat tautan
  const assignData = { lead_id, campaign_id, user_id: userId, status_id };
  const newCampaignLead = await campaignLeadModel.create(assignData);

  // 5. TIDAK BUAT LOG HISTORY (Sesuai logika baru)

  return newCampaignLead;
};

/**
 * Logika untuk "Update Status" (Deal, Reject, dll) oleh Sales
 */
const updateLeadStatus = async (campaignLeadId, userId, statusId) => {
  // 1. Validasi
  if (!statusId) throw new ApiError(400, 'status_id harus diisi');

  const campaignLead = await campaignLeadModel.findById(campaignLeadId);
  if (!campaignLead) {
    throw new ApiError(404, 'Tautan Campaign-Lead tidak ditemukan');
  }

  // 3. Otorisasi Sales
  if (campaignLead.user_id !== userId) {
    throw new ApiError(403, 'Forbidden: Anda tidak bisa mengubah status lead milik sales lain');
  }
  
  if (campaignLead.status_id === statusId) {
    throw new ApiError(400, 'Status sudah sama dengan status saat ini');
  }

  // 5. Update status
  const updatedCampaignLead = await campaignLeadModel.updateStatus(campaignLeadId, statusId);

  // 6. LOGIKA BARU: BUAT LOG HISTORY HANYA JIKA DEAL ATAU REJECT
  if (statusId === 3 || statusId === 4) {
    const historyData = {
      lead_id: updatedCampaignLead.lead_id,
      campaign_id: updatedCampaignLead.campaign_id,
      status_id: updatedCampaignLead.status_id,
      changed_by: userId,
    };
    await historyModel.create(historyData);
  }

  return updatedCampaignLead;
};

/**
 * Logika untuk 'Leads Tracker'
 */
const getSalesLeadTracker = async (userId, queryOptions) => {
  const page = parseInt(queryOptions.page, 10) || 1;
  const limit = parseInt(queryOptions.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = queryOptions.search || '';
  const campaignId = queryOptions.campaign_id || null;

  const options = { userId, limit, offset, search, campaignId };

  // Query ini sudah di-filter HANYA status 1, 2, 5 di model
  const leads = await campaignLeadModel.findAllForSalesUser(options);
  const totalLeads = await campaignLeadModel.countAllForSalesUser(options);
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
 * LOGIKA BARU: Admin Override Status
 */
const adminUpdateLeadStatus = async (campaignLeadId, newStatusId, adminUserId) => {
  // 1. Validasi
  if (!newStatusId) throw new ApiError(400, 'status_id baru harus diisi');
  
  const campaignLead = await campaignLeadModel.findById(campaignLeadId);
  if (!campaignLead) {
    throw new ApiError(404, 'Tautan Campaign-Lead tidak ditemukan');
  }

  const oldStatusId = campaignLead.status_id;
  if (oldStatusId === newStatusId) {
    throw new ApiError(400, 'Status sudah sama dengan status saat ini');
  }

  const updatedCampaignLead = await campaignLeadModel.updateStatus(campaignLeadId, newStatusId);
  const { lead_id, campaign_id } = updatedCampaignLead;

  // 3. Logika History (Paling Penting)
  const wasFinal = oldStatusId === 3 || oldStatusId === 4;
  const isNowFinal = newStatusId === 3 || newStatusId === 4;

  if (wasFinal && !isNowFinal) {
    // KASUS: Admin mengembalikan dari History (3/4) ke Tracker (1/2/5)
    // Hapus log history yang lama
    await historyModel.deleteFinalStatus(lead_id, campaign_id, oldStatusId);
  } 
  else if (!wasFinal && isNowFinal) {
    // KASUS: Admin mengubah dari Tracker (1/2/5) ke History (3/4)
    // Buat log history baru atas nama ADMIN
    await historyModel.create({
      lead_id, campaign_id, status_id: newStatusId, changed_by: adminUserId
    });
  }
  else if (wasFinal && isNowFinal) {
    // KASUS: Admin mengubah dari Deal (3) ke Reject (4) atau sebaliknya
    // Hapus log lama, buat log baru
    await historyModel.deleteFinalStatus(lead_id, campaign_id, oldStatusId);
    await historyModel.create({
      lead_id, campaign_id, status_id: newStatusId, changed_by: adminUserId
    });
  }
  // KASUS: Admin mengubah 1 -> 2 (sesama Tracker) tidak perlu aksi history.

  return updatedCampaignLead;
};

module.exports = {
  assignLeadToCampaign,
  updateLeadStatus,
  getSalesLeadTracker,
  adminUpdateLeadStatus, // LOGIKA BARU
};