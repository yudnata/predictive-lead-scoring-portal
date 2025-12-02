import axiosClient from '../../../api/axiosClient';

const CampaignService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await axiosClient.get(
      `/campaigns?page=${page}&limit=${limit}&search=${search}`
    );
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
};

export default CampaignService;
