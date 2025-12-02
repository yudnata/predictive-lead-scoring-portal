import axiosClient from '../../../api/axiosClient';

const LeadsTrackerService = {
  getAll: async (page = 1, limit = 10, search = '', campaign_id = null, user_id) => {
    const params = { page, limit, search, user_id };

    if (campaign_id) {
      params.campaign_id = campaign_id;
    }

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
