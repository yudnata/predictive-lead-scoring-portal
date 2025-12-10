import axiosClient from '../../../api/axiosClient';

const LeadService = {
  getAll: async (page = 1, limit = 14, search = '', filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      search,
      ...filters,
    });
    const response = await axiosClient.get(`/leads?${params.toString()}`);
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

  uploadCSV: async (file, limit) => {
    const formData = new FormData();
    formData.append('file', file);
    if (limit) {
      formData.append('limit', limit);
    }
    const response = await axiosClient.post('/leads/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addToCampaign: async (leadId, campaignId, userId) => {
    const response = await axiosClient.post('/campaign-leads/assign', {
      lead_id: leadId,
      campaign_id: campaignId,
      user_id: userId,
      status_id: 3,
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

  getSegments: async () => {
    const response = await axiosClient.get('/leads/segments');
    return response.data.data;
  },

  getExplanation: async (leadId) => {
    const response = await axiosClient.get(`/leads/${leadId}/explain`);
    return response.data.data;
  },
};

export default LeadService;
