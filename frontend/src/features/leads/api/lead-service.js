import axiosClient from '../../../api/axiosClient';

const LeadService = {
  // GET /api/v1/leads
  getAll: async (page = 1, limit = 14, search = '') => {
    const response = await axiosClient.get(`/leads?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  // GET /api/v1/leads/:leadId
  getById: async (leadId) => {
    const response = await axiosClient.get(`/leads/${leadId}`);
    return response.data.data;
  },

  // POST /api/v1/leads
  create: async (leadData, detailData) => {
    const response = await axiosClient.post('/leads', { leadData, detailData });
    return response.data.data;
  },

  // PATCH /api/v1/leads/:leadId
  update: async (leadId, leadData, detailData) => {
    const response = await axiosClient.patch(`/leads/${leadId}`, { leadData, detailData });
    return response.data.data;
  },

  // DELETE /api/v1/leads/:leadId
  delete: async (leadId) => {
    await axiosClient.delete(`/leads/${leadId}`);
    return null;
  },

  // POST /api/v1/leads/upload-csv
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Override Content-Type untuk upload file
    const response = await axiosClient.post('/leads/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

export default LeadService;
