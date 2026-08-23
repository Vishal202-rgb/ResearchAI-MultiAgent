import { create } from 'zustand';
import libraryService from '../services/libraryService';

const useLibraryStore = create((set, get) => ({
  insights: [],
  sources: [],
  loading: false,
  error: null,

  fetchLibrary: async () => {
    set({ loading: true, error: null });
    try {
      const [insightsRes, sourcesRes] = await Promise.all([
        libraryService.getInsights(),
        libraryService.getSources()
      ]);
      set({ 
        insights: insightsRes.data || [], 
        sources: sourcesRes.data || [],
        loading: false 
      });
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Failed to fetch library' });
    }
  },

  saveInsight: async (insightData) => {
    try {
      const res = await libraryService.saveInsight(insightData);
      set(state => ({ insights: [res.data, ...state.insights] }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to save insight' };
    }
  },

  updateInsight: async (id, updateData) => {
    try {
      const res = await libraryService.updateInsight(id, updateData);
      set(state => ({
        insights: state.insights.map(i => i._id === id ? res.data : i)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update insight' };
    }
  },

  deleteInsight: async (id) => {
    try {
      await libraryService.deleteInsight(id);
      set(state => ({
        insights: state.insights.filter(i => i._id !== id)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete insight' };
    }
  },

  saveSource: async (sourceData) => {
    try {
      const res = await libraryService.saveSource(sourceData);
      set(state => ({ sources: [res.data, ...state.sources] }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to save source' };
    }
  },

  updateSource: async (id, updateData) => {
    try {
      const res = await libraryService.updateSource(id, updateData);
      set(state => ({
        sources: state.sources.map(s => s._id === id ? res.data : s)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update source' };
    }
  },

  deleteSource: async (id) => {
    try {
      await libraryService.deleteSource(id);
      set(state => ({
        sources: state.sources.filter(s => s._id !== id)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete source' };
    }
  }
}));

export default useLibraryStore;
