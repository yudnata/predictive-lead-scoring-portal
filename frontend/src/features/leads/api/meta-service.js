import axiosClient from '../../../api/axiosClient';

const MetaService = {
  getJobs: async () => {
    const response = await axiosClient.get('/meta/jobs');
    return response.data;
  },
  getMaritalStatus: async () => {
    const response = await axiosClient.get('/meta/marital-status');
    return response.data;
  },
  getEducationLevels: async () => {
    const response = await axiosClient.get('/meta/education-levels');
    return response.data;
  },
};

export default MetaService;
