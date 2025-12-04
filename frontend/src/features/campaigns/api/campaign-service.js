import axiosClient from '../../../api/axiosClient';

const CampaignService = {
  getAll: async (page = 1, limit = 10, search = '', filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);

    if (filters.isActive !== '') {
      params.append('is_active', filters.isActive);
    }
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);

    const response = await axiosClient.get(`/campaigns?${params.toString()}`);
    return response.data;
  },

  create: async (campaignData) => {
    const response = await axiosClient.post('/campaigns', campaignData);
    return response.data.data;
  },

  update: async (campaignId, campaignData) => {
    const response = await axiosClient.patch(`/campaigns/${campaignId}`, campaignData);
    return response.data.data;
  },

  getById: async (campaignId) => {
    const response = await axiosClient.get(`/campaigns/${campaignId}`);
    return response.data.data;
  },

  delete: async (campaignId) => {
    await axiosClient.delete(`/campaigns/${campaignId}`);
    return null;
  },

  getAssignedForUser: async () => {
    const response = await axiosClient.get('/campaign-assignments/my-assignments');
    return response.data;
  },

  getOptions: async () => {
    const response = await axiosClient.get('/campaigns/options');
    return response.data.data;
  },
};

export default CampaignService;
