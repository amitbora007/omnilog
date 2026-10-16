import { apiRequest } from './client.js';

export const contactApi = {
  /**
   * Submit contact form inquiry
   * @param {Object} data - { name, email, subject, message }
   */
  submitMessage: (data) =>
    apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
