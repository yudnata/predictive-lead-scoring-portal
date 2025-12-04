import axiosClient from '../../../api/axiosClient';

const HistoryService = {
  getAll: async (page = 1, limit = 10, search = '', filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);

    if (filters.campaignId) params.append('campaign_id', filters.campaignId);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.statusId) params.append('status_id', filters.statusId);

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

  delete: async (historyId) => {
    const response = await axiosClient.delete(`/history/${historyId}`);
    return response.data;
  },
};

export default HistoryService;
