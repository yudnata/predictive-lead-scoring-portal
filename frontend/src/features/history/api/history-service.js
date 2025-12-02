import axiosClient from '../../../api/axiosClient';

const HistoryService = {
  getAll: async (page = 1, limit = 10, search = '', campaign_id = null) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    if (campaign_id) params.append('campaign_id', campaign_id);

    const response = await axiosClient.get(`/history?${params.toString()}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosClient.post('/history', payload);
    return response.data;
  },

  update: async (historyId, payload) => {
    const response = await axiosClient.patch(`/history/${historyId}`, payload);
    return response.data;
  },
};

export default HistoryService;