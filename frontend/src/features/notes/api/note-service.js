import axiosClient from '../../../api/axiosClient';

const NoteService = {
  getByLeadId: async (leadId) => {
    const response = await axiosClient.get(`/leads/${leadId}/notes`);
    return response.data.data;
  },

  create: async (leadId, noteContent) => {
    const response = await axiosClient.post(`/leads/${leadId}/notes`, {
      note_content: noteContent,
    });
    return response.data.data;
  },

  delete: async (leadId, noteId) => {
    await axiosClient.delete(`/leads/${leadId}/notes/${noteId}`);
  },
};

export default NoteService;
