import axiosClient from '../../../api/axiosClient';

const LeadService = {
  getAll: async (page = 1, limit = 14, search = '') => {
    const response = await axiosClient.get(`/leads?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getById: async (leadId) => {
    const response = await axiosClient.get(`/leads/${leadId}`);
    return response.data.data;
  },

  create: async (leadData, detailData) => {
    const response = await axiosClient.post('/leads', { leadData, detailData });
    return response.data.data;
  },

  update: async (leadId, leadData, detailData) => {
    const response = await axiosClient.patch(`/leads/${leadId}`, { leadData, detailData });
    return response.data.data;
  },

  delete: async (leadId) => {
    await axiosClient.delete(`/leads/${leadId}`);
    return null;
  },

  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post('/leads/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  addToCampaign: async (leadId, campaignId, userId) => {
    const response = await axiosClient.post('/campaign-leads/assign', {
      lead_id: leadId,
      campaign_id: campaignId,
      user_id: userId,
      status_id: 3, // Uncontacted status for Leads Tracker
    });
    return response.data;
  },

  getCampaignsByLead: async (leadId) => {
    const response = await axiosClient.get(`/leads/${leadId}/campaigns`);
    return response.data.data;
  },

  batchDelete: async (leadIds) => {
    const response = await axiosClient.post('/leads/batch-delete', { leadIds });
    return response.data;
  },
};

export default LeadService;
