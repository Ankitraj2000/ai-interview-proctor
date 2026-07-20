import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import QuestionBankStudio from '../components/QuestionBankStudio';
import {
  Calendar, Plus, FileText, Download, Play, AlertCircle, CheckCircle, Search,
  HelpCircle, FileSpreadsheet, Users, Video, Clock, ShieldAlert, BarChart2,
  Trash2, Edit, Copy, Eye, Star, Filter, RefreshCw, X, Check, Award, Sliders,
  UserCheck, UserX, AlertTriangle, ArrowUpRight, CheckSquare, BookOpen
} from 'lucide-react';

const InterviewerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active Recruiter Workspace Tab
  const [activeTab, setActiveTab] = useState('overview');

  // State Data
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [liveSessions, setLiveSessions] = useState([]);
  const [aiViolations, setAiViolations] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [reports, setReports] = useState([]);
  const [globalAnalytics, setGlobalAnalytics] = useState(null);
  const [compareSessionsList, setCompareSessionsList] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [compareData, setCompareData] = useState([]);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportRiskFilter, setReportRiskFilter] = useState('');

  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form State for Schedule & Edit
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [interviewType, setInterviewType] = useState('FULL_STACK');
  const [enableAiProctoring, setEnableAiProctoring] = useState(true);
  const [enableBrowserLock, setEnableBrowserLock] = useState(true);
  const [enableWebcam, setEnableWebcam] = useState(true);
  const [enableMicrophone, setEnableMicrophone] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Candidate Resume Preview Modal
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Evaluation & Feedback State
  const [evalSessionId, setEvalSessionId] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [decision, setDecision] = useState('APPROVE');
  const [evalSuccess, setEvalSuccess] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [page, statusFilter, searchQuery]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Analytics Summary
      try {
        const analyticsRes = await api.get('/analytics/summary');
        setAnalytics(analyticsRes.data || {});
      } catch (e) {
        console.error("Analytics fetch failed:", e);
      }

      // 2. Fetch Interviews Pageable
      const interviewRes = await api.get('/interviews/interviewer', {
        params: { page, size: 10 }
      });
      setInterviews(interviewRes.data.content || []);
      setTotalPages(interviewRes.data.totalPages || 1);

      // 3. Fetch Question Sets
      const qRes = await api.get('/question-sets');
      setQuestionSets(qRes.data || []);

      // Fetch Interview Templates
      try {
        const templatesRes = await api.get('/interview-templates');
        setTemplates(templatesRes.data || []);
      } catch (e) {
        console.error("Templates fetch failed:", e);
      }

      // Fetch proctor reports list
      try {
        const reportsRes = await api.get('/reports/all');
        setReports(reportsRes.data || []);
      } catch (e) {
        console.error("Reports listing fetch failed:", e);
      }

      // Fetch global recruiter analytics
      try {
        const analyticsRes = await api.get('/reports/analytics');
        setGlobalAnalytics(analyticsRes.data || null);
      } catch (e) {
        console.error("Global analytics fetch failed:", e);
      }

      // 4. Mock Candidate List for ATS
      setCandidates([
        {
          id: 39,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane2@example.com',
          phone: '+1 (555) 234-5678',
          skills: 'Java 21, Spring Boot, React, Python, Docker',
          education: 'M.S. Computer Science - Stanford University',
          experience: '4 Years - Senior Software Developer',
          trustScore: 98.5,
          resumeUrl: '/api/users/resume/download'
        },
        {
          id: 34,
          firstName: 'Ankit',
          lastName: 'Raj',
          email: 'ankitraj25581@gmail.com',
          phone: '+91 9876543210',
          skills: 'FastAPI, PyTorch, OpenCV, MediaPipe, Node.js',
          education: 'B.Tech IT - National Institute of Technology',
          experience: '5 Years - AI & Computer Vision Engineer',
          trustScore: 94.2,
          resumeUrl: '/api/users/resume/download'
        }
      ]);

      // 5. Mock AI Violations for Review
      setAiViolations([
        { id: 1, type: 'CAMERA_BLOCKED', time: '10:14:02 AM', severity: 'HIGH', confidence: '96%', candidate: 'Jane Doe', details: 'Webcam shutter closed or lens covered.' },
        { id: 2, type: 'PHONE_DETECTED', time: '10:14:28 AM', severity: 'HIGH', confidence: '98%', candidate: 'Jane Doe', details: 'Mobile phone object detected in video frame.' },
        { id: 3, type: 'TAB_SWITCH', time: '10:15:05 AM', severity: 'MEDIUM', confidence: '100%', candidate: 'Ankit Raj', details: 'Switched browser tab away from proctored window.' },
        { id: 4, type: 'LOOKING_AWAY', time: '10:16:40 AM', severity: 'LOW', confidence: '88%', candidate: 'Ankit Raj', details: 'Gaze deviation for > 5 seconds.' }
      ]);

      // 6. Mock Live Sessions
      setLiveSessions([
        { id: 16, title: 'Full Stack AI Developer Test', candidateName: 'Jane Doe', candidateEmail: 'jane2@example.com', code: 'TECH101', remainingMinutes: 32, currentQ: 2, totalQ: 3, warnings: 2, status: 'LIVE', cameraOk: true, micOk: true, fullscreenOk: true }
      ]);

    } catch (err) {
      console.error("Failed to load recruiter workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Schedule or Update Interview Handler
  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (!title || !candidateEmail || !scheduledStart || !scheduledEnd) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        candidateEmail,
        durationMinutes: parseInt(durationMinutes),
        scheduledStart: scheduledStart.includes('T') ? scheduledStart.replace('T', ' ') + ':00' : scheduledStart + ':00',
        scheduledEnd: scheduledEnd.includes('T') ? scheduledEnd.replace('T', ' ') + ':00' : scheduledEnd + ':00',
        timezone,
        questionSetId: selectedQuestionSetId ? parseInt(selectedQuestionSetId) : null,
        difficulty: selectedDifficulty,
        questionCount: parseInt(questionCount),
        interviewType: interviewType,
        enableAiProctoring,
        enableBrowserLock,
        enableWebcam,
        enableMicrophone
      };

      if (editingInterviewId) {
        await api.put(`/interviews/${editingInterviewId}`, payload);
        setFormSuccess('Interview parameters updated successfully!');
      } else {
        await api.post('/interviews', payload);
        setFormSuccess('Interview scheduled and email invitation sent to candidate!');
      }

      resetForm();
      fetchInitialData();
    } catch (err) {
      console.error("Save interview error:", err);
      setFormError(err.response?.data?.message || 'Failed to save interview schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (interview) => {
    setEditingInterviewId(interview.id);
    setTitle(interview.title || '');
    setDescription(interview.description || '');
    setCandidateEmail(interview.candidateEmail || '');
    setDurationMinutes(interview.durationMinutes || 60);
    setSelectedDifficulty(interview.difficulty || 'MEDIUM');
    setQuestionCount(interview.questionCount || 5);
    setInterviewType(interview.interviewType || 'FULL_STACK');
    setEnableAiProctoring(interview.enableAiProctoring !== false);
    setEnableBrowserLock(interview.enableBrowserLock !== false);
    setEnableWebcam(interview.enableWebcam !== false);
    setEnableMicrophone(interview.enableMicrophone !== false);
    if (interview.questionSetId) {
      setSelectedQuestionSetId(interview.questionSetId);
    }
    setShowScheduleForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete/cancel this interview?")) return;
    try {
      await api.delete(`/interviews/${id}`);
      fetchInitialData();
    } catch (err) {
      console.error("Delete interview error:", err);
      alert("Failed to delete interview.");
    }
  };

  const handleDuplicateClick = async (id) => {
    try {
      await api.post(`/interviews/${id}/duplicate`);
      alert("Interview duplicated successfully!");
      fetchInitialData();
    } catch (err) {
      console.error("Duplicate interview error:", err);
      alert("Failed to duplicate interview.");
    }
  };

  const resetForm = () => {
    setEditingInterviewId(null);
    setTitle('');
    setDescription('');
    setCandidateEmail('');
    setDurationMinutes(60);
    setScheduledStart('');
    setScheduledEnd('');
    setSelectedQuestionSetId('');
    setSelectedDifficulty('MEDIUM');
    setQuestionCount(5);
    setInterviewType('FULL_STACK');
    setEnableAiProctoring(true);
    setEnableBrowserLock(true);
    setEnableWebcam(true);
    setEnableMicrophone(true);
    setSelectedTemplateId('');
  };

  const handleApplyTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setTitle(template.name || '');
      setDescription(template.description || '');
      setDurationMinutes(template.durationMinutes || 60);
      setInterviewType(template.interviewType || 'FULL_STACK');
      setSelectedDifficulty(template.difficulty || 'MEDIUM');
      if (template.questionSet) {
        setSelectedQuestionSetId(template.questionSet.id || '');
        setQuestionCount(template.questionSet.totalQuestions || 5);
      }
      setEnableAiProctoring(template.enableAiProctoring !== false);
      setEnableBrowserLock(template.enableBrowserLock !== false);
      setEnableWebcam(template.enableWebcam !== false);
      setEnableMicrophone(template.enableMicrophone !== false);
    }
  };

  // Submit Feedback & Evaluation
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!evalSessionId) return;

    try {
      await api.post(`/sessions/${evalSessionId}/feedback`, {
        rating,
        feedbackNotes,
        decision
      });
      setEvalSuccess('Evaluation feedback saved successfully!');
      setTimeout(() => setEvalSuccess(''), 3000);
    } catch (err) {
      console.error("Evaluation submission error:", err);
      alert("Failed to submit feedback.");
    }
  };

  const downloadReportPdf = (sessionId) => {
    window.open(`/api/reports/download/pdf/${sessionId}`, '_blank');
  };

  const downloadReportExcel = (sessionId) => {
    window.open(`/api/reports/download/excel/${sessionId}`, '_blank');
  };

  const handleCompareCandidates = async () => {
    if (compareSessionsList.length < 2) {
      alert("Please select at least 2 candidate reports to compare side by side.");
      return;
    }
    try {
      const res = await api.get('/reports/compare', {
        params: { sessionIds: compareSessionsList.join(',') }
      });
      setCompareData(res.data || []);
      setShowComparisonModal(true);
    } catch (err) {
      console.error("Failed to compare candidate sessions:", err);
      alert("Failed to compile comparison matrix: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      {/* Workspace Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Award className="h-7 w-7 text-brand-500" />
              <span>Recruiter Proctor Suite</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Assessment & AI Proctoring Operations Dashboard</p>
          </div>

          <button
            onClick={() => { resetForm(); setShowScheduleForm(true); }}
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Interview</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mt-6 border-t border-slate-800/80 pt-4">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: BarChart2 },
            { id: 'questions', label: 'Question Bank', icon: BookOpen },
            { id: 'interviews', label: 'Interviews & Schedule', icon: Calendar },
            { id: 'reports', label: 'Evaluation Reports', icon: FileSpreadsheet },
            { id: 'live', label: 'Live Monitoring', icon: Video, badge: liveSessions.length },
            { id: 'ats', label: 'Candidate ATS', icon: Users },
            { id: 'violations', label: 'AI Violations Log', icon: ShieldAlert, badge: aiViolations.length },
            { id: 'eval', label: 'Candidate Evaluation', icon: CheckSquare },
            { id: 'calendar', label: 'Calendar View', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-brand-500/20 text-brand-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-6 space-y-6">

        {/* TAB: QUESTION BANK */}
        {activeTab === 'questions' && (
          <QuestionBankStudio />
        )}

        {/* TAB: EVALUATION REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Global Metrics bar summary from globalAnalytics */}
            {globalAnalytics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Candidates</span>
                  <div className="text-xl font-bold text-white mt-1">{globalAnalytics.totalCandidates}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Average Test Score</span>
                  <div className="text-xl font-bold text-white mt-1">{globalAnalytics.averageScore}%</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Passed count</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{globalAnalytics.passedCount}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Flagged count</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">{globalAnalytics.flaggedCount}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">High Integrity</span>
                  <div className="text-xl font-bold text-purple-400 mt-1">{globalAnalytics.lowRiskCount}</div>
                </div>
              </div>
            )}

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter reports by candidate name, company, or job role..."
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={reportRiskFilter}
                  onChange={(e) => setReportRiskFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-350 px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="">All Risk Levels</option>
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="CRITICAL">Critical Risk</option>
                </select>

                <button
                  onClick={handleCompareCandidates}
                  disabled={compareSessionsList.length < 2}
                  className="bg-brand-500 hover:bg-brand-650 disabled:opacity-50 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Compare Selected ({compareSessionsList.length})</span>
                </button>
              </div>
            </div>

            {/* Reports listing grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              {reports
                .filter(r => {
                  const matchSearch = (r.candidateName || '').toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                    (r.companyName || '').toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                    (r.jobRole || '').toLowerCase().includes(reportSearchQuery.toLowerCase());
                  const matchRisk = reportRiskFilter ? (r.riskLevel || 'LOW') === reportRiskFilter : true;
                  return matchSearch && matchRisk;
                })
                .map(r => (
                  <div key={r.id || r.sessionId} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between gap-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={compareSessionsList.includes(r.sessionId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCompareSessionsList([...compareSessionsList, r.sessionId]);
                            } else {
                              setCompareSessionsList(compareSessionsList.filter(id => id !== r.sessionId));
                            }
                          }}
                          className="mt-1 h-4.5 w-4.5 accent-brand-500 rounded cursor-pointer"
                        />
                        <div>
                          <h3 className="font-bold text-white text-base leading-snug">{r.candidateName}</h3>
                          <span className="text-[11px] text-brand-400 font-mono block mt-0.5">{r.candidateEmail}</span>
                          <span className="text-xs text-slate-450 block mt-1">{r.jobRole || 'N/A'} at {r.companyName || 'Enterprise'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          (r.riskLevel || 'LOW') === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          (r.riskLevel || 'LOW') === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {r.riskLevel || 'LOW'} Risk
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          r.decision === 'PASS' ? 'bg-emerald-600/20 text-emerald-300' :
                          r.decision === 'FLAGGED' ? 'bg-amber-600/20 text-amber-300' :
                          'bg-rose-600/20 text-rose-300'
                        }`}>
                          {r.decision}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Overall</span>
                        <span className="font-bold text-white mt-0.5 block">{r.finalScore?.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Integrity</span>
                        <span className="font-bold text-brand-400 mt-0.5 block">{(r.aiIntegrityScore || 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                        <span className="font-bold text-white mt-0.5 block">{r.duration || 60}m</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-slate-550">Completed: {new Date(r.generatedAt || Date.now()).toLocaleDateString()}</span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/reports/${r.sessionId}`)}
                          className="bg-brand-500 hover:bg-brand-650 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Report</span>
                        </button>
                        <button
                          onClick={() => downloadReportPdf(r.sessionId)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 p-1.5 rounded-xl"
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => downloadReportExcel(r.sessionId)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 p-1.5 rounded-xl"
                          title="Export Excel"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">Total Interviews</span>
                  <Calendar className="h-4 w-4 text-brand-500" />
                </div>
                <div className="text-2xl font-bold text-white">{analytics.totalInterviews || 12}</div>
                <span className="text-[11px] text-emerald-400 font-semibold">+18% vs last month</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">Live & Today</span>
                  <Video className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{analytics.todayInterviews || 3}</div>
                <span className="text-[11px] text-emerald-400 font-semibold">2 Sessions Active</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">Average Candidate Score</span>
                  <Star className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">{analytics.averageCandidateScore || 84.5}%</div>
                <span className="text-[11px] text-slate-400">Based on evaluated submissions</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">AI Integrity Index</span>
                  <ShieldAlert className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{analytics.aiIntegrityAverage || 96.8}%</div>
                <span className="text-[11px] text-emerald-400 font-semibold">High Integrity Overall</span>
              </div>
            </div>

            {/* Hiring & Violation Distribution Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-brand-500" />
                  <span>Monthly Interview Distribution</span>
                </h3>
                <div className="space-y-3 pt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => (
                    <div key={m} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{m} 2026</span>
                        <span className="font-mono text-slate-400">{[4, 7, 12, 18, 24, 30][i]} Interviews</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${([4, 7, 12, 18, 24, 30][i] / 30) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>AI Violation Severity Breakdown</span>
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>High Risk (Phone, Multiple Faces, Shutter Closed)</span>
                      <span className="font-mono text-rose-400 font-bold">2 Incidents</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: '15%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Medium Risk (Tab Switch, Fullscreen Exit)</span>
                      <span className="font-mono text-amber-400 font-bold">5 Incidents</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '35%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Low Risk (Gaze Shift, Minor Audio Noise)</span>
                      <span className="font-mono text-blue-400 font-bold">11 Incidents</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERVIEWS & SCHEDULING */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search interviews by title, candidate or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="LIVE">Live</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Interviews List Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase text-slate-400">
                    <th className="p-4">Title & Access Code</th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Type & Difficulty</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {interviews.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        No interviews found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    interviews.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[11px] font-mono text-brand-400">Code: {item.accessCode || item.code}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-200 block">{item.candidateEmail}</span>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-700 mr-2">
                            {item.interviewType || 'SUBJECTIVE'}
                          </span>
                          <span className="text-slate-400 text-[11px]">{item.difficulty || 'MEDIUM'}</span>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">
                          {item.durationMinutes} mins
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' :
                            item.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Edit Parameters"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateClick(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400"
                            title="Duplicate Interview"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                            title="Cancel / Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE MONITORING */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Real-Time Candidate Proctoring Monitor</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveSessions.map(sess => (
                <div key={sess.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{sess.candidateName}</h3>
                      <span className="text-xs text-slate-400">{sess.title}</span>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                      ● LIVE NOW
                    </span>
                  </div>

                  {/* Camera Monitor Simulator */}
                  <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Video className="h-8 w-8 text-brand-500 mx-auto animate-pulse" />
                      <span className="text-xs text-slate-400 font-mono block">LIVE STREAM ACTIVE ({sess.code})</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                      Q{sess.currentQ} of {sess.totalQ}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {sess.warnings} Strikes
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => alert(`Warning dispatched to ${sess.candidateName}`)}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Issue Warning</span>
                    </button>

                    <button
                      onClick={() => alert(`Session ${sess.id} suspended by recruiter.`)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl"
                    >
                      Suspend Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CANDIDATE ATS */}
        {activeTab === 'ats' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-500" />
                <span>Candidate Applicant Tracking System (ATS)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.map(cand => (
                  <div key={cand.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-base">{cand.firstName} {cand.lastName}</h3>
                        <span className="text-xs text-brand-400">{cand.email}</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-full">
                        Trust: {cand.trustScore}%
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300">
                      <p><strong className="text-slate-400">Education:</strong> {cand.education}</p>
                      <p><strong className="text-slate-400">Experience:</strong> {cand.experience}</p>
                      <p><strong className="text-slate-400">Skills:</strong> {cand.skills}</p>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        onClick={() => { setSelectedCandidate(cand); setShowResumeModal(true); }}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5 text-brand-400" />
                        <span>Preview Resume</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI VIOLATIONS LOG */}
        {activeTab === 'violations' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>Real-Time AI Telemetry Violation Audit</span>
                </h2>
              </div>

              <div className="space-y-3">
                {aiViolations.map(viol => (
                  <div key={viol.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${viol.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {viol.type}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300 font-semibold">{viol.candidate}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{viol.details}</p>
                    </div>

                    <div className="text-right space-y-1 font-mono">
                      <span className="text-slate-500 text-[10px] block">{viol.time}</span>
                      <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-800">
                        Confidence: {viol.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CANDIDATE EVALUATION & FEEDBACK */}
        {activeTab === 'eval' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-400" />
                <span>Candidate Evaluation & Hiring Recommendation</span>
              </h2>

              <form onSubmit={handleSubmitEvaluation} className="space-y-5 max-w-2xl">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Select Candidate Session:</label>
                  <select
                    value={evalSessionId || ''}
                    onChange={(e) => setEvalSessionId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none"
                  >
                    <option value="">Select session to evaluate...</option>
                    <option value="15">Session #15 - Jane Doe (Full Stack AI Developer Test)</option>
                    <option value="16">Session #16 - Jane Doe (Full Stack AI Developer Test)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Technical & Overall Rating (1 to 5 Stars):</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-xl transition-all ${rating >= star ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 bg-slate-950'}`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Hiring Action Decision:</label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none"
                  >
                    <option value="APPROVE">Approve - Proceed to Offer</option>
                    <option value="RECOMMEND_NEXT_ROUND">Recommend Next Technical Round</option>
                    <option value="RECOMMEND_HR_ROUND">Recommend HR Interview</option>
                    <option value="HOLD">Keep On Hold</option>
                    <option value="REJECT">Reject Candidate</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Recruiter Feedback & Evaluation Notes:</label>
                  <textarea
                    rows="4"
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Enter technical comments, communication notes, and recommendation rationale..."
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {evalSuccess && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs border border-emerald-500/20">
                    {evalSuccess}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
                  >
                    Save Candidate Evaluation
                  </button>

                  {evalSessionId && (
                    <>
                      <button
                        type="button"
                        onClick={() => downloadReportPdf(evalSessionId)}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5 text-brand-400" />
                        <span>Download PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadReportExcel(evalSessionId)}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Download Excel</span>
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-500" />
                <span>Recruiter Interview Calendar</span>
              </h2>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-800">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>

              <div className="grid grid-cols-7 gap-2 min-h-[300px]">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className={`p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs font-mono flex flex-col justify-between ${
                    i + 1 === 20 ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500' : ''
                  }`}>
                    <span className="text-slate-400 font-bold">{i + 1}</span>
                    {i + 1 === 20 && (
                      <span className="bg-brand-500 text-white text-[9px] font-bold p-1 rounded-md block mt-2">
                        2 Interviews Scheduled
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* SCHEDULE & EDIT INTERVIEW MODAL */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-left space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingInterviewId ? 'Edit Interview Parameters' : 'Schedule New Assessment'}
              </h3>
              <button onClick={() => setShowScheduleForm(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInterview} className="space-y-4 text-xs">
              {formError && <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">{formError}</div>}
              {formSuccess && <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">{formSuccess}</div>}

              <div>
                <label className="text-slate-350 block mb-1 font-semibold text-brand-400">1-Click Load Interview Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none"
                >
                  <option value="">Choose template to prefill parameters...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category} • {t.interviewType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Interview Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Java Fullstack Assessment"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Candidate Email Address *</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Scheduled Start *</label>
                  <input
                    type="datetime-local"
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Scheduled End *</label>
                  <input
                    type="datetime-local"
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Questions</label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Assessment Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none"
                  >
                    <option value="FULL_STACK">Full Stack</option>
                    <option value="CODING_INTERVIEW">Coding</option>
                    <option value="SUBJECTIVE">Subjective</option>
                    <option value="MCQ">MCQ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Question Set Template</label>
                <select
                  value={selectedQuestionSetId}
                  onChange={(e) => setSelectedQuestionSetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none"
                >
                  <option value="">Select question bank set (or random if empty)...</option>
                  {questionSets.map(qs => (
                    <option key={qs.id} value={qs.id}>{qs.name} ({qs.category} • {qs.difficulty})</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                <span className="font-bold text-brand-400 block border-b border-slate-850 pb-1">AI Proctoring Security Rules</span>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAiProctoring}
                      onChange={(e) => setEnableAiProctoring(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Webcam AI Detection</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableBrowserLock}
                      onChange={(e) => setEnableBrowserLock(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Browser Focus Lock</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableWebcam}
                      onChange={(e) => setEnableWebcam(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Require Webcam active</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableMicrophone}
                      onChange={(e) => setEnableMicrophone(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Require Microphone</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md"
                >
                  {submitting ? 'Saving...' : editingInterviewId ? 'Update Schedule' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESUME PREVIEW MODAL */}
      {showResumeModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                Resume Preview: {selectedCandidate.firstName} {selectedCandidate.lastName}
              </h3>
              <button onClick={() => setShowResumeModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <p><strong className="text-white">Candidate Email:</strong> {selectedCandidate.email}</p>
              <p><strong className="text-white">Education:</strong> {selectedCandidate.education}</p>
              <p><strong className="text-white">Experience:</strong> {selectedCandidate.experience}</p>
              <p><strong className="text-white">Technical Skills:</strong> {selectedCandidate.skills}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a
                href={selectedCandidate.resumeUrl}
                download
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Download Resume File</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* COMPARATIVE ANALYSIS CANDIDATE MODAL */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-5xl w-full text-left space-y-4 shadow-2xl overflow-x-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-brand-500" />
                  <span>Candidate Comparative Performance Matrix</span>
                </h3>
                <span className="text-[10px] text-slate-400">Side-by-side assessment score breakdowns and AI compliance indicators.</span>
              </div>
              <button onClick={() => setShowComparisonModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <table className="w-full text-left border-collapse text-xs mt-2">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">Candidate Metric</th>
                  {compareData.map(c => (
                    <th key={c.sessionId} className="p-3 text-center border-l border-slate-800">{c.candidateName}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">Email Address</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 text-[10px] font-mono text-brand-400">{c.candidateEmail}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">Hiring Decision</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.decision === 'PASS' ? 'bg-emerald-500/10 text-emerald-400' :
                        c.decision === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-450'
                      }`}>
                        {c.decision}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">Overall Score</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 font-bold text-white font-mono">{c.finalScore?.toFixed(1)}%</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">AI Integrity Score</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 font-bold font-mono text-emerald-400">{c.aiIntegrityScore?.toFixed(1)}%</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">Proctor Risk Level</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 uppercase font-bold text-orange-400">{c.riskLevel}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">Technical Score</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 font-mono">{c.technicalScore?.toFixed(1)} / 40</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">Coding Score</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 font-mono">{c.codingScore?.toFixed(1)} / 30</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">MCQ Score</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 font-mono">{c.mcqScore?.toFixed(1)} / 20</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-semibold">Subjective Score</td>
                  {compareData.map(c => (
                    <td key={c.sessionId} className="p-3 text-center border-l border-slate-800 font-mono">{c.subjectiveScore?.toFixed(1)} / 10</td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl border border-slate-750"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;
