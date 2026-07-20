import api from './api';

/**
 * Report Service — wraps all /reports/* REST endpoints.
 */
const reportService = {
  /**
   * Trigger score aggregation and decision generation for a completed session.
   * Interviewer role required.
   * @param {number} sessionId
   * @returns {Promise<{ id, finalScore, decision, summary, generatedAt }>}
   */
  generateReport: (sessionId) => api.post(`/reports/generate/${sessionId}`),

  /**
   * Fetch an existing report for a session.
   * @param {number} sessionId
   */
  getReportBySession: (sessionId) => api.get(`/reports/session/${sessionId}`),

  /**
   * Fetch all reports for a given candidate.
   * @param {number} candidateId
   */
  getCandidateReports: (candidateId) => api.get(`/reports/candidate/${candidateId}`),

  /**
   * Download the PDF proctor report as a Blob.
   * @param {number} sessionId
   * @returns {Promise<Blob>}
   */
  downloadPdf: (sessionId) =>
    api.get(`/reports/download/pdf/${sessionId}`, { responseType: 'blob' }),

  /**
   * Download the Excel proctor report as a Blob.
   * @param {number} sessionId
   * @returns {Promise<Blob>}
   */
  downloadExcel: (sessionId) =>
    api.get(`/reports/download/excel/${sessionId}`, { responseType: 'blob' }),
};

/**
 * Helper — trigger a browser file download from an Axios blob response.
 * @param {AxiosResponse} response  - Blob response from downloadPdf/downloadExcel
 * @param {string}        filename  - e.g. "report_session_1.pdf"
 */
export const triggerDownload = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default reportService;
