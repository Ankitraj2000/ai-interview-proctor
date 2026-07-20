import api from './api';

/**
 * Session Service — wraps all /sessions/* REST endpoints.
 */
const sessionService = {
  /**
   * Initialize a new live proctoring session for an interview.
   * Must be called by a Candidate who is mapped to that interview.
   * @param {number} interviewId
   */
  startSession: (interviewId) => api.post(`/sessions/start/${interviewId}`),

  /**
   * Explicitly submit the session (marks it SUBMITTED and closes proctoring).
   * @param {number} sessionId
   */
  submitSession: (sessionId) => api.post(`/sessions/${sessionId}/submit`),

  /**
   * Log a client-side browser behavior violation.
   * Uses query parameters as required by the backend controller.
   * @param {number}  sessionId
   * @param {string}  violationType  - TAB_SWITCH | FULLSCREEN_EXIT | DEV_TOOLS_OPENED | COPY_PASTE
   * @param {string}  details        - Human-readable description
   */
  logViolation: (sessionId, violationType, details) =>
    api.post(`/sessions/${sessionId}/violation`, null, {
      params: { violationType, details },
    }),

  /**
   * Register an AI-detected anomaly event.
   * @param {number}  sessionId
   * @param {string}  eventType       - LOOKING_AWAY | PHONE_DETECTED | MULTIPLE_PEOPLE | NO_FACE
   * @param {number}  confidence      - 0.0–1.0 confidence score from the model
   * @param {string}  [screenshotPath]- Optional path to a saved screenshot
   */
  logAiEvent: (sessionId, eventType, confidence, screenshotPath = null) =>
    api.post(`/sessions/${sessionId}/ai-event`, null, {
      params: { eventType, confidence, ...(screenshotPath && { screenshotPath }) },
    }),

  /**
   * Fetch session metadata and telemetry counters.
   * @param {number} sessionId
   */
  getSession: (sessionId) => api.get(`/sessions/${sessionId}`),

  /**
   * Fetch all browser violation logs for a session.
   * @param {number} sessionId
   */
  getCheatingLogs: (sessionId) => api.get(`/sessions/${sessionId}/cheating-logs`),

  /**
   * Fetch all AI anomaly events for a session.
   * @param {number} sessionId
   */
  getAiEvents: (sessionId) => api.get(`/sessions/${sessionId}/ai-events`),

  /**
   * Fetch all sessions linked to an interview.
   * @param {number} interviewId
   */
  getSessionsByInterview: (interviewId) =>
    api.get(`/sessions/interview/${interviewId}`),
};

export default sessionService;
