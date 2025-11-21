import axiosClient from '../../../api/axiosClient';

const UserService = {
  // GET /api/v1/users
  getAllSales: async (page = 1, limit = 14, search = '') => {
    const response = await axiosClient.get(`/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  // GET /api/v1/users/:userId
  getById: async (userId) => {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data.data;
  },

  // PATCH /api/v1/users/:userId
  update: async (userId, userData) => {
    const response = await axiosClient.patch(`/users/${userId}`, userData);
    return response.data.data;
  },

  // POST /api/v1/users
  create: async (userData) => {
    const response = await axiosClient.post('/users', userData);
    return response.data.data;
  },

  // DELETE /api/v1/users/:userId
  delete: async (userId) => {
    await axiosClient.delete(`/users/${userId}`);
    return null;
  },
};

export default UserService;
