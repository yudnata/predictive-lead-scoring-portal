import axiosClient from '../../../api/axiosClient';

const LeadsTrackerService = {
  queryLeads: async (queryOptions, userId, minStatusName = null, filterSelf = false) => {
    const params = { ...queryOptions, user_id: userId, minStatusName, filterSelf };
    if (queryOptions.campaignFilter) params.campaignId = queryOptions.campaignFilter;

    const res = await axiosClient.get('/leads-tracker', { params });
    return res.data;
  },

  getAll: async (page = 1, limit = 10, search = '', filters = {}, user_id, filterSelf = false) => {
    const params = { page, limit, search, user_id, filterSelf };

    if (filters.campaignId) params.campaign_id = filters.campaignId;
    if (filters.minScore) params.min_score = parseFloat(filters.minScore) / 100;
    if (filters.maxScore) params.max_score = parseFloat(filters.maxScore) / 100;

    const res = await axiosClient.get('/leads-tracker', { params });
    return res.data;
  },
  getOutbound: async (page = 1, limit = 10, search = '', userId) => {
    const params = { page, limit, search, user_id: userId };
    const res = await axiosClient.get('/leads-tracker/getOutbound', { params });
    return res.data;
  },

  updateStatus: async (id, payload) => {
    const res = await axiosClient.patch(`/leads-tracker/${id}/status`, payload);
    return res.data;
  },

  addOutbound: async (lead_campaign_id, payload) => {
    const res = await axiosClient.post(`/leads-tracker/${lead_campaign_id}/outbound`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/campaign-leads/${id}`);
    return res.data;
  },
};

export default LeadsTrackerService;
