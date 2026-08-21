import { create } from 'zustand';
import workspaceService from '../services/workspaceService.js';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  stats: { totalWorkspaces: 0, activeResearch: 0, documents: 0 },
  loading: false,
  error: null,

  fetchWorkspaces: async () => {
    try {
      set({ loading: true, error: null });
      const response = await workspaceService.getAll();
      set({ workspaces: response.data.data.workspaces, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch workspaces';
      set({ loading: false, error: message });
    }
  },

  fetchWorkspace: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await workspaceService.getById(id);
      set({ currentWorkspace: response.data.data.workspace, loading: false });
      return { success: true, workspace: response.data.data.workspace };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch workspace';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  createWorkspace: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await workspaceService.create(data);
      const workspace = response.data.data.workspace;
      set((state) => ({
        workspaces: [workspace, ...state.workspaces],
        loading: false,
      }));
      return { success: true, workspace };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create workspace';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  updateWorkspace: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const response = await workspaceService.update(id, data);
      const updated = response.data.data.workspace;
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w._id === id ? updated : w)),
        currentWorkspace: state.currentWorkspace?._id === id ? updated : state.currentWorkspace,
        loading: false,
      }));
      return { success: true, workspace: updated };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update workspace';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  deleteWorkspace: async (id) => {
    try {
      set({ loading: true, error: null });
      await workspaceService.delete(id);
      set((state) => ({
        workspaces: state.workspaces.filter((w) => w._id !== id),
        currentWorkspace: state.currentWorkspace?._id === id ? null : state.currentWorkspace,
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete workspace';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  fetchStats: async () => {
    try {
      const response = await workspaceService.getStats();
      set({ stats: response.data.data.stats });
    } catch (error) {
      // Silently fail for stats
    }
  },

  clearCurrentWorkspace: () => set({ currentWorkspace: null }),
  clearError: () => set({ error: null }),
}));

export default useWorkspaceStore;
