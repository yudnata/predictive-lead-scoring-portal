import axiosClient from '../../../api/axiosClient';

const UserService = {
  getAllSales: async (page = 1, limit = 14, search = '') => {
    const response = await axiosClient.get(`/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getAllOnlySales: async () => {
    const response = await axiosClient.get(`/users?role=sales`);
    return response.data.data;
  },

  getById: async (userId) => {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data.data;
  },

  update: async (userId, userData) => {
    const response = await axiosClient.patch(`/users/${userId}`, userData);
    return response.data.data;
  },

  create: async (userData) => {
    const response = await axiosClient.post('/users', userData);
    return response.data.data;
  },

  delete: async (userId) => {
    await axiosClient.delete(`/users/${userId}`);
    return null;
  },
};

export default UserService;
