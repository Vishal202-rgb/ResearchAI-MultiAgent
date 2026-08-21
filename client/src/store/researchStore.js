// import { create } from 'zustand';
// import researchService from '../services/researchService.js';

// const useResearchStore = create((set, get) => ({
//   plan: null,
//   run: null,
//   runs: [],
//   results: null,
//   sources: [],
//   loading: false,
//   generating: false,
//   running: false,
//   error: null,

//   generatePlan: async (workspaceId) => {
//     try {
//       set({ generating: true, error: null });
//       const response = await researchService.generatePlan(workspaceId);
//       set({ plan: response.data.data.plan, generating: false });
//       return { success: true, plan: response.data.data.plan };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to generate research plan';
//       set({ generating: false, error: message });
//       return { success: false, message };
//     }
//   },

//   fetchPlan: async (workspaceId) => {
//     try {
//       set({ loading: true, error: null });
//       const response = await researchService.getPlan(workspaceId);
//       set({ plan: response.data.data.plan, loading: false });
//       return { success: true, plan: response.data.data.plan };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to fetch research plan';
//       set({ loading: false, error: message });
//       return { success: false, message };
//     }
//   },

//   startRun: async (workspaceId) => {
//     try {
//       set({ running: true, error: null });
//       const response = await researchService.startRun(workspaceId);
//       set({ run: response.data.data.run });
//       return { success: true, run: response.data.data.run };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to start research';
//       set({ running: false, error: message });
//       return { success: false, message };
//     }
//   },

//   fetchRun: async (workspaceId) => {
//     try {
//       const response = await researchService.getRun(workspaceId);
//       const { run, runs } = response.data.data;
//       const isRunning = run?.status === 'running';
//       set({ run, runs, running: isRunning });
//       return { success: true, run, runs };
//     } catch (error) {
//       return { success: false };
//     }
//   },

//   fetchResults: async (workspaceId) => {
//     try {
//       const response = await researchService.getResults(workspaceId);
//       const { finding, sources, run } = response.data.data;
//       set({ results: finding, sources, running: false });
//       return { success: true, finding, sources };
//     } catch (error) {
//       return { success: false };
//     }
//   },

//   clearResearch: () => set({ plan: null, run: null, runs: [], results: null, sources: [], error: null, running: false }),
//   clearError: () => set({ error: null }),
// }));

// export default useResearchStore;

import { create } from 'zustand';
import researchService from '../services/researchService.js';

const useResearchStore = create((set, get) => ({
  plan: null,
  run: null,
  runs: [],
  results: null,
  sources: [],

  loading: false,
  generating: false,
  running: false,
  error: null,

  // Generate research plan
  generatePlan: async (workspaceId) => {
    try {
      set({ generating: true, error: null });

      const response = await researchService.generatePlan(workspaceId);
      const plan = response.data.data.plan;

      set({
        plan,
        generating: false,
      });

      return {
        success: true,
        plan,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to generate research plan';

      set({
        generating: false,
        error: message,
      });

      return {
        success: false,
        message,
      };
    }
  },

  // Fetch existing research plan
  fetchPlan: async (workspaceId) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await researchService.getPlan(workspaceId);
      const plan = response.data.data.plan;

      set({
        plan,
        loading: false,
      });

      return {
        success: true,
        plan,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to fetch research plan';

      set({
        loading: false,
        error: message,
      });

      return {
        success: false,
        message,
      };
    }
  },

  // Start research run
  startRun: async (workspaceId) => {
    try {
      set({
        running: true,
        error: null,
      });

      const response = await researchService.startRun(workspaceId);
      const run = response.data.data.run;

      set({
        run,
      });

      return {
        success: true,
        run,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to start research';

      set({
        running: false,
        error: message,
      });

      return {
        success: false,
        message,
      };
    }
  },

  // Fetch research run
  fetchRun: async (workspaceId) => {
    try {
      const response = await researchService.getRun(workspaceId);

      const { run, runs } = response.data.data;

      const isRunning = run?.status === 'running';

      set({
        run,
        runs,
        running: isRunning,
      });

      return {
        success: true,
        run,
        runs,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  },

  // Fetch research results
  fetchResults: async (workspaceId) => {
    try {
      const response = await researchService.getResults(workspaceId);

      const { finding, sources, run } = response.data.data;

      set({
        results: finding,
        sources,
        run,
        running: false,
      });

      return {
        success: true,
        finding,
        sources,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  },

  // Clear only research plan
  clearPlan: () =>
    set({
      plan: null,
      error: null,
    }),

  // Clear all research data
  clearResearch: () =>
    set({
      plan: null,
      run: null,
      runs: [],
      results: null,
      sources: [],
      error: null,
      running: false,
      generating: false,
    }),

  // Clear error
  clearError: () =>
    set({
      error: null,
    }),
}));

export default useResearchStore;