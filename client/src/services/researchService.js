import api from './api.js';

const researchService = {
  // Planner (Part 3)
  generatePlan: (workspaceId) => api.post(`/research/planner/${workspaceId}`),
  getPlan: (workspaceId) => api.get(`/research/planner/${workspaceId}`),

  // Research Run (Part 4)
  startRun: (workspaceId) => api.post(`/research/run/${workspaceId}`),
  getRun: (workspaceId) => api.get(`/research/run/${workspaceId}`),
  getResults: (workspaceId) => api.get(`/research/results/${workspaceId}`),
};

export default researchService;
