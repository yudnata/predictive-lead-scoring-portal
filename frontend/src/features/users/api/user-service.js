import axiosClient from '../../../api/axiosClient';

const UserService = {
  getAllSales: async (page = 1, limit = 14, search = '', filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);

    if (filters.isActive !== '') params.append('is_active', filters.isActive);
    if (filters.minLeads) params.append('min_leads', filters.minLeads);
    if (filters.maxLeads) params.append('max_leads', filters.maxLeads);

    const response = await axiosClient.get(`/users?${params.toString()}`);
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
