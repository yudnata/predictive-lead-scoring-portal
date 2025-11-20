// src/services/LeadService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/leads';

const getConfig = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const LeadService = {
  // GET /api/v1/leads
  getAll: async (page = 1, limit = 14, search = '') => {
    const config = getConfig();
    const response = await axios.get(
      `${API_BASE_URL}?page=${page}&limit=${limit}&search=${search}`,
      config
    );
    return response.data;
  },

  // GET /api/v1/leads/:leadId
  getById: async (leadId) => {
    const config = getConfig();
    const response = await axios.get(`${API_BASE_URL}/${leadId}`, config);
    return response.data.data;
  },

  // POST /api/v1/leads (Membutuhkan leadData dan detailData)
  create: async (leadData, detailData) => {
    const config = getConfig();
    const response = await axios.post(API_BASE_URL, { leadData, detailData }, config);
    return response.data.data;
  },

  // PATCH /api/v1/leads/:leadId
  update: async (leadId, leadData, detailData) => {
    const config = getConfig();
    const response = await axios.patch(
      `${API_BASE_URL}/${leadId}`,
      { leadData, detailData },
      config
    );
    return response.data.data;
  },

  // DELETE /api/v1/leads/:leadId
  delete: async (leadId) => {
    const config = getConfig();
    await axios.delete(`${API_BASE_URL}/${leadId}`, config);
    return null;
  },

  // POST /api/v1/leads/upload-csv
  uploadCSV: async (file) => {
    const config = getConfig();
    const formData = new FormData();
    formData.append('file', file);
    
    config.headers['Content-Type'] = undefined; 

    const response = await axios.post(`${API_BASE_URL}/upload-csv`, formData, config);
    return response.data.data;
  },
};

export default LeadService;