import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/users'; // Asumsi base route untuk Sales Users

const getConfig = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const UserService = {
  // GET /api/v1/users/sales?page=... 
  getAllSales: async (page = 1, limit = 14, search = '') => {
    const config = getConfig();
    const response = await axios.get(
      `${API_BASE_URL}/sales?page=${page}&limit=${limit}&search=${search}`,
      config
    );
    return response.data; 
  },
  
  // GET /api/v1/users/sales/:userId 
  getById: async (userId) => {
    const config = getConfig();
    const response = await axios.get(`${API_BASE_URL}/sales/${userId}`, config);
    return response.data.data;
  },
  
  // PATCH /api/v1/users/sales/:userId 
  update: async (userId, userData) => {
    const config = getConfig();
    const response = await axios.patch(`${API_BASE_URL}/sales/${userId}`, userData, config);
    return response.data.data;
  },
  
  // POST /api/v1/users/sales 
  create: async (userData) => {
    const config = getConfig();
    const response = await axios.post(`${API_BASE_URL}/sales`, userData, config);
    return response.data.data;
  },
  
  // DELETE /api/v1/users/sales/:userId 
  delete: async (userId) => {
    const config = getConfig();
    await axios.delete(`${API_BASE_URL}/sales/${userId}`, config);
    return null;
  },
};

export default UserService;