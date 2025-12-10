import axiosClient from '../../../api/axiosClient';

const logActivity = async (data) => {
  const response = await axiosClient.post('/outbound-activities', data);
  return response.data;
};

const getHistory = async (leadId, campaignId) => {
  const url = campaignId
    ? `/outbound-activities/${leadId}?campaign_id=${campaignId}`
    : `/outbound-activities/${leadId}`;
  const response = await axiosClient.get(url);
  return response.data;
};

const OutboundService = {
  logActivity,
  getHistory,
};

export default OutboundService;
