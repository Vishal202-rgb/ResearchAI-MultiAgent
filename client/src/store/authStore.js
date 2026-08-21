import { create } from 'zustand';
import api from '../services/api.js';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  register: async (name, email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, loading: false, error: null });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, loading: false, error: null });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false });
        return;
      }
      const response = await api.get('/auth/me');
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
