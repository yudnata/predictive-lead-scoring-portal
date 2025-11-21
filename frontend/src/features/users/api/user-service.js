import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/users'; // Base route untuk users

const getConfig = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const UserService = {
  // GET /api/v1/users?page=... (Backend sudah memfilter role='sales' di endpoint ini)
  getAllSales: async (page = 1, limit = 14, search = '') => {
    const config = getConfig();
    const response = await axios.get(
      `${API_BASE_URL}?page=${page}&limit=${limit}&search=${search}`, // HAPUS '/sales'
      config
    );
    return response.data;
  },

  // GET /api/v1/users/:userId
  getById: async (userId) => {
    const config = getConfig();
    const response = await axios.get(`${API_BASE_URL}/${userId}`, config); // HAPUS '/sales'
    return response.data.data;
  },

  // PATCH /api/v1/users/:userId
  update: async (userId, userData) => {
    const config = getConfig();
    const response = await axios.patch(`${API_BASE_URL}/${userId}`, userData, config); // HAPUS '/sales'
    return response.data.data;
  },

  // POST /api/v1/users
  create: async (userData) => {
    const config = getConfig();
    const response = await axios.post(`${API_BASE_URL}`, userData, config); // HAPUS '/sales'
    return response.data.data;
  },

  // DELETE /api/v1/users/:userId
  delete: async (userId) => {
    const config = getConfig();
    await axios.delete(`${API_BASE_URL}/${userId}`, config); // HAPUS '/sales'
    return null;
  },
};

export default UserService;
