import axiosClient from '../../../api/axiosClient';

const OutboundDetailService = {
  getAll: async (page = 1, limit = 10, search = '', campaign_id = null, user_id) => {
    const params = {
      page,
      limit,
      search,
      user_id,
    };

    if (campaign_id) {
      params.campaign_id = campaign_id;
    }

    const res = await axiosClient.get('/outbound-detail', { params });
    return res.data;
  },
};

export default OutboundDetailService;
