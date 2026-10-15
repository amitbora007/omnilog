import { apiRequest } from './client.js';

export const postsApi = {
  getPublicPosts: async ({ tag, search, page = 1, limit = 12 } = {}) => {
    const params = new URLSearchParams();
    if (tag && tag !== 'all') params.append('tag', tag);
    if (search) params.append('search', search);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/posts${query}`);
  },

  getPostById: async (id) => {
    const res = await apiRequest(`/posts/${id}`);
    return res.data;
  },

  createPost: async (postData) => {
    return await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  updatePost: async (id, postData) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  deletePost: async (id) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  },

  getMyPosts: async (options = {}) => {
    const scope = typeof options === 'string' ? options : options?.scope;
    const query = scope ? `?scope=${scope}` : '';
    return await apiRequest(`/posts/my-posts${query}`);
  },

  getUserPosts: async (userId) => {
    return await apiRequest(`/posts/user/${userId}`);
  },

  getPopularTags: async () => {
    const res = await apiRequest('/posts/tags/popular');
    return res.data || [];
  },
};
