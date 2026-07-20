import api from './api';

/**
 * Auth Service — wraps all /auth/* REST endpoints.
 */
const authService = {
  /**
   * Register a new user account.
   * @param {Object} payload - { firstName, lastName, email, password, roles: ['CANDIDATE'|'INTERVIEWER'|'ADMIN'] }
   */
  register: (payload) => api.post('/auth/register', payload),

  /**
   * Submit email + OTP code to activate account.
   * @param {string} email
   * @param {string} otp
   */
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),

  /**
   * Resend a fresh OTP to the given email address.
   * @param {string} email
   */
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),

  /**
   * Authenticate and receive a JWT token pair.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token, refreshToken, id, email, firstName, lastName, roles }>}
   */
  login: (email, password) => api.post('/auth/login', { email, password }),

  /**
   * Initiate forgotten password flow — sends OTP to email.
   * @param {string} email
   */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /**
   * Complete password reset using OTP as token.
   * @param {string} email
   * @param {string} token  - OTP received in email
   * @param {string} newPassword
   */
  resetPassword: (email, token, newPassword) =>
    api.post('/auth/reset-password', { email, token, newPassword }),
};

export default authService;
