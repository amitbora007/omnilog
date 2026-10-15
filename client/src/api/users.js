import { apiRequest } from './client.js';

export const usersApi = {
  getUsers: async ({ page = 1, limit = 20, search, role, status } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search && search.trim()) params.append('search', search.trim());
    if (role && role !== 'all') params.append('role', role);
    if (status && status !== 'all') params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/users${query}`);
  },

  getUserById: async (id) => {
    const res = await apiRequest(`/users/${id}`);
    return res.data;
  },

  createUser: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
