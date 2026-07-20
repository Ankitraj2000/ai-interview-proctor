import api from './api';

/**
 * Interview Service — wraps all /interviews/* REST endpoints.
 */
const interviewService = {
  /**
   * Schedule a new interview (Interviewer role required).
   * @param {Object} payload - { title, description, durationMinutes, candidateEmail, scheduledStart, scheduledEnd, timezone }
   */
  createInterview: (payload) => api.post('/interviews', payload),

  /**
   * Fetch paginated interview list for the authenticated interviewer.
   * @param {number} page
   * @param {number} size
   */
  getInterviewerSchedule: (page = 0, size = 10) =>
    api.get('/interviews/interviewer', { params: { page, size } }),

  /**
   * Fetch paginated interview list for the authenticated candidate.
   * @param {number} page
   * @param {number} size
   */
  getCandidateSchedule: (page = 0, size = 10) =>
    api.get('/interviews/candidate', { params: { page, size } }),

  /**
   * Look up an interview by its unique access code.
   * @param {string} code - e.g. "B15A4912"
   */
  getInterviewByCode: (code) => api.get(`/interviews/code/${code}`),

  /**
   * Get a single interview by its numeric ID.
   * @param {number} id
   */
  getInterviewById: (id) => api.get(`/interviews/${id}`),

  /**
   * Update an interview's status (SCHEDULED → LIVE → COMPLETED | CANCELLED).
   * @param {number} id
   * @param {string} status
   */
  updateInterviewStatus: (id, status) =>
    api.patch(`/interviews/${id}/status`, null, { params: { status } }),
};

export default interviewService;
