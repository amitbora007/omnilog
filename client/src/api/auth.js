import { apiRequest, API_BASE_URL } from './client.js';

export const authApi = {
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,

  getMe: async () => {
    const res = await apiRequest('/auth/me', { silent: true });
    return res.data;
  },

  logout: async () => {
    localStorage.removeItem('omnilog_token');
    return await apiRequest('/auth/logout', { method: 'POST' });
  },
};
