import axiosClient from '../../../api/axiosClient';

const CampaignService = {
  // GET /api/v1/campaigns
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await axiosClient.get(
      `/campaigns?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
  },

  // POST /api/v1/campaigns
  create: async (campaignData) => {
    const response = await axiosClient.post('/campaigns', campaignData);
    return response.data.data;
  },

  // PATCH /api/v1/campaigns/:campaignId
  update: async (campaignId, campaignData) => {
    const response = await axiosClient.patch(`/campaigns/${campaignId}`, campaignData);
    return response.data.data;
  },

  // GET /api/v1/campaigns/:campaignId
  getById: async (campaignId) => {
    const response = await axiosClient.get(`/campaigns/${campaignId}`);
    return response.data.data;
  },

  delete: async (campaignId) => {
    await axiosClient.delete(`/campaigns/${campaignId}`);
    return null;
  },
};

export default CampaignService;
