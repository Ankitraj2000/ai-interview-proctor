import api from './api';

/**
 * User Service — wraps all /users/* REST endpoints.
 */
const userService = {
  /**
   * Fetch the authenticated user's profile.
   * @returns {Promise<{ id, email, firstName, lastName, roles, isEnabled }>}
   */
  getProfile: () => api.get('/users/profile'),

  /**
   * Update the authenticated user's profile fields.
   * @param {Object} payload - { firstName, lastName } (partial update supported)
   */
  updateProfile: (payload) => api.put('/users/profile', payload),

  /**
   * Upload a resume PDF/DOCX for the authenticated candidate.
   * @param {File} file - The resume file object from an <input type="file">
   */
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/resume', formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  /**
   * Fetch all registered users (Admin role required).
   * @param {number} page
   * @param {number} size
   */
  getAllUsers: (page = 0, size = 20) =>
    api.get('/users', { params: { page, size } }),

  /**
   * Fetch a single user by their numeric ID (Admin role required).
   * @param {number} id
   */
  getUserById: (id) => api.get(`/users/${id}`),

  /**
   * Delete a user account (Admin role required).
   * @param {number} id
   */
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default userService;
