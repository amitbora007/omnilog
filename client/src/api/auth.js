import { apiRequest, API_BASE_URL } from './client.js';

export const authApi = {
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,

  getMe: async () => {
    const res = await apiRequest('/auth/me');
    return res.data;
  },

  logout: async () => {
    localStorage.removeItem('omnilog_token');
    return await apiRequest('/auth/logout', { method: 'POST' });
  },

  adminLogin: async (credentials = {}) => {
    const res = await apiRequest('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      localStorage.setItem('omnilog_token', res.token);
    }
    return res;
  },

  devLogin: async (credentials = {}) => {
    return await authApi.adminLogin(credentials);
  },
};
