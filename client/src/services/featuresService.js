import api from './api.js';

export const documentService = {
  uploadDocument: (workspaceId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/documents/${workspaceId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDocuments: (workspaceId) => api.get(`/documents/${workspaceId}`),
};

export const chatService = {
  getMessages: (workspaceId) => api.get(`/chat/${workspaceId}`),
  sendMessage: (workspaceId, message) => api.post(`/chat/${workspaceId}`, { message }),
};

export const graphService = {
  getGraph: (workspaceId) => api.get(`/graph/${workspaceId}`),
  generateGraph: (workspaceId) => api.post(`/graph/${workspaceId}/generate`),
};

export const reportService = {
  getReport: (workspaceId) => api.get(`/reports/${workspaceId}`),
  generateReport: (workspaceId) => api.post(`/reports/${workspaceId}/generate`),
  exportPdfUrl: (workspaceId) => `${api.defaults.baseURL}/reports/${workspaceId}/export/pdf`,
};
