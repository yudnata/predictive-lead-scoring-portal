import axiosClient from '../../../api/axiosClient';

const AiService = {
  chat: async (messages, leadContext = null) => {
    const response = await axiosClient.post('/ai/chat', {
      messages,
      leadContext
    });
    return response.data;
  }
};

export default AiService;
