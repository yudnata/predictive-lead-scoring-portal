import axiosClient from './axiosClient';

const MetaService = {
  getJobs: async () => {
    const response = await axiosClient.get('/meta/jobs');
    return response.data.data;
  },
  getMaritalStatus: async () => {
    const response = await axiosClient.get('/meta/marital-status');
    return response.data.data;
  },
  getEducationLevels: async () => {
    const response = await axiosClient.get('/meta/education-levels');
    return response.data.data;
  },
  getPoutcomes: async () => {
    const response = await axiosClient.get('/meta/p-outcomes');
    return response.data.data;
  },
  getContactMethods: async () => {
    const response = await axiosClient.get('/meta/contact-methods');
    return response.data.data;
  },
};

export default MetaService;
