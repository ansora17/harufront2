import api from "./axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "/api";
export const issueApi = {
  // Get all issues with pagination
  getIssues: async (page = 1, size = 15, search = "") => {
    const response = await api.get("/api/issues", {
      params: { page, size, search },
    });
    return response.data;
  },

  // Get single issue by ID
  getIssue: async (id) => {
    const response = await api.get(`/api/issues/${id}`);
    return response.data;
  },

  // Create new issue
  createIssue: async (issueData) => {
    const response = await api.post("/api/issues", issueData);
    return response.data;
  },

  // Update existing issue
  updateIssue: async (id, issueData) => {
    const response = await api.put(`/api/issues/${id}`, issueData);
    return response.data;
  },

  // Delete issue
  deleteIssue: async (id) => {
    const response = await api.delete(`/api/issues/${id}`);
    return response.data;
  },

  // Get hot issues (admin)
  getHotIssues: async (id) => {
    const response = await api.get(`${API_BASE_URL}/issues/admin/${id}`);
    return response.data;
  },
};
