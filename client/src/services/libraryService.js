import api from './api';

const libraryService = {
  getInsights: async () => {
    const response = await api.get('/library/insights');
    return response.data;
  },

  saveInsight: async (insightData) => {
    const response = await api.post('/library/insights', insightData);
    return response.data;
  },

  updateInsight: async (id, updateData) => {
    const response = await api.put(`/library/insights/${id}`, updateData);
    return response.data;
  },

  deleteInsight: async (id) => {
    const response = await api.delete(`/library/insights/${id}`);
    return response.data;
  },

  getSources: async () => {
    const response = await api.get('/library/sources');
    return response.data;
  },

  saveSource: async (sourceData) => {
    const response = await api.post('/library/sources', sourceData);
    return response.data;
  },

  updateSource: async (id, updateData) => {
    const response = await api.put(`/library/sources/${id}`, updateData);
    return response.data;
  },

  deleteSource: async (id) => {
    const response = await api.delete(`/library/sources/${id}`);
    return response.data;
  }
};

export default libraryService;
