import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/campaigns';

const getConfig = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const CampaignService = {
  // GET /api/v1/campaigns
  getAll: async (page = 1, limit = 10, search = '') => {
    const config = getConfig();
    const response = await axios.get(
      `${API_BASE_URL}?page=${page}&limit=${limit}&search=${search}`,
      config
    );
    return response.data;
  },

  // POST /api/v1/campaigns
  create: async (campaignData) => {
    const config = getConfig();
    const response = await axios.post(API_BASE_URL, campaignData, config);
    return response.data.data;
  },

  // PATCH /api/v1/campaigns/:campaignId
  update: async (campaignId, campaignData) => {
    const config = getConfig();
    const response = await axios.patch(
      `${API_BASE_URL}/${campaignId}`,
      campaignData,
      config
    );
    return response.data.data;
  },

  // GET /api/v1/campaigns/:campaignId
  getById: async (campaignId) => {
    const config = getConfig();
    const response = await axios.get(`${API_BASE_URL}/${campaignId}`, config);
    return response.data.data;
  },

  delete: async (campaignId) => {
    const config = getConfig();
    await axios.delete(`${API_BASE_URL}/${campaignId}`, config);
    return null; 
  },
};

export default CampaignService;