import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import notificationService from '../services/notificationService';
import Navbar from '../components/Navbar';
import {
  Calendar, UploadCloud, Play, User, FileText, CheckCircle, AlertTriangle, Key,
  ShieldCheck, Clock, Award, BarChart2, Bell, Settings, Lock, Eye, Download,
  Trash2, ExternalLink, RefreshCw, CheckCircle2, XCircle, Search, Filter,
  ChevronRight, Sparkles, AlertCircle, FileCheck, UserCheck, Globe, Linkedin,
  Github, Mail, Phone, MapPin, CalendarDays, Briefcase, GraduationCap, Copy,
  Check, Moon, Sun, Info, EyeOff
} from 'lucide-react';

const CandidateDashboard = () => {
  const { user, logout, updateUserData } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // State Management
  const [activeTab, setActiveTab] = useState('overview'); // overview, interviews, history, profile, resume, analytics, notifications, settings
  const [loading, setLoading] = useState(true);

  // Data states
  const [profile, setProfile] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [resume, setResume] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Join by code state
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [codeCopied, setCodeCopied] = useState('');

  // Resume Upload State
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showResumePreview, setShowResumePreview] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dob: '',
    gender: '',
    skills: '',
    education: '',
    experience: '',
    certifications: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    photo: ''
  });
  const [profileMessage, setProfileMessage] = useState('');

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Filter & Search states for History
  const [historyFilter, setHistoryFilter] = useState('ALL'); // ALL, COMPLETED, MISSED, CANCELLED
  const [searchQuery, setSearchQuery] = useState('');

  // Result Modal State
  const [selectedReport, setSelectedReport] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    language: 'English (US)',
    timezone: 'UTC (Coordinated Universal Time)',
    privacyVisible: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Candidate Profile
      try {
        const profileRes = await api.get('/users/profile');
        setProfile(profileRes.data);
        setProfileForm({
          firstName: profileRes.data.firstName || '',
          lastName: profileRes.data.lastName || '',
          phone: profileRes.data.phone || '',
          address: profileRes.data.address || '',
          dob: profileRes.data.dob || '',
          gender: profileRes.data.gender || 'Prefer not to say',
          skills: profileRes.data.skills || '',
          education: profileRes.data.education || '',
          experience: profileRes.data.experience || '',
          certifications: profileRes.data.certifications || '',
          bio: profileRes.data.bio || '',
          linkedinUrl: profileRes.data.linkedinUrl || '',
          githubUrl: profileRes.data.githubUrl || '',
          portfolioUrl: profileRes.data.portfolioUrl || '',
          photo: profileRes.data.photo || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }

      // 2. Fetch Assigned Interviews
      try {
        const interviewsRes = await api.get('/interviews/candidate');
        setInterviews(interviewsRes.data.content || []);
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
      }

      // 3. Fetch Resume metadata
      try {
        const resumeRes = await api.get('/users/resume');
        setResume(resumeRes.data);
      } catch (err) {
        setResume(null);
      }

      // 4. Fetch Notifications
      try {
        const notifRes = await notificationService.getNotifications();
        setNotifications(notifRes.data || []);
        const unread = (notifRes.data || []).filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }

    } catch (err) {
      console.error("Error loading candidate dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Profile Update Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      const response = await api.put('/users/profile', profileForm);
      setProfile(response.data);
      if (updateUserData) updateUserData(response.data);
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setProfileMessage('Failed to update profile. Please try again.');
    }
  };

  // Avatar Upload Handler (Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Profile picture size must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileForm(prev => ({ ...prev, photo: '' }));
  };

  // Password Change Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await api.post('/users/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMessage('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMessage(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    }
  };

  // Resume Upload Handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setUploadStatus('File size exceeds maximum limit of 10MB.');
        return;
      }
      setFile(selected);
      setUploadStatus('');
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploadStatus('Uploading CV...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/users/resume', formData, {
        headers: { 'Content-Type': undefined }
      });
      setUploadStatus('Resume uploaded & parsed successfully!');
      setFile(null);
      
      const resumeRes = await api.get('/users/resume');
      setResume(resumeRes.data);
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (err) {
      console.error("Resume upload failed:", err);
      setUploadStatus('Upload failed. Please upload a valid PDF or DOCX file (max 10MB).');
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to remove your resume?")) return;
    try {
      await api.delete('/users/resume');
      setResume(null);
      setUploadStatus('Resume removed.');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const response = await api.get('/users/resume/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume?.fileName || 'Resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download resume file:", err);
      alert("Could not download resume. File may not exist on server.");
    }
  };

  // Join by Access Code Handler
  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    setJoinError('');

    try {
      const response = await api.get(`/interviews/code/${joinCode}`);
      const interview = response.data;
      
      if (interview.status === 'COMPLETED' || interview.status === 'CANCELLED') {
        setJoinError(`This interview session has already been ${interview.status.toLowerCase()}.`);
        return;
      }
      if (interview.candidateEmail && interview.candidateEmail !== user.email) {
        setJoinError('You are not authorized for this interview session.');
        return;
      }

      navigate(`/room/${joinCode}`);
    } catch (err) {
      console.error("Failed to verify code:", err);
      setJoinError('Invalid access code. Please check and try again.');
    }
  };

  // Copy code helper
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(code);
    setTimeout(() => setCodeCopied(''), 2000);
  };

  // Notifications Actions
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Not Scheduled';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Dashboard Stats Calculations
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
  const upcomingInterviews = interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'LIVE');
  const missedInterviews = interviews.filter(i => i.status === 'MISSED' || i.status === 'EXPIRED');

  // Filtered History
  const historyList = interviews.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || (i.code && i.code.toLowerCase().includes(searchQuery.toLowerCase()));
    if (historyFilter === 'ALL') return matchesSearch;
    return matchesSearch && i.status === historyFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="glass border dark:border-dark-400 p-6 md:p-8 rounded-3xl mb-8 relative overflow-hidden bg-gradient-to-r from-brand-500/10 via-indigo-500/5 to-purple-500/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="h-4 w-4" />
                <span>Candidate Interview Portal</span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                Welcome back, {profile?.firstName || user?.firstName || 'Candidate'}!
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 max-w-2xl">
                Manage your proctored assessments, update your qualifications, inspect AI evaluation reports, and track your interview pipeline.
              </p>
            </div>

            {/* Quick Access Code Form */}
            <form onSubmit={handleJoinByCode} className="w-full md:w-auto bg-white/80 dark:bg-dark-800/80 p-3 rounded-2xl border dark:border-dark-400 shadow-md backdrop-blur-md">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Join Interview with Code</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ACCESS CODE"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-44 uppercase font-bold tracking-widest"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-brand-500/20 text-sm flex items-center gap-1.5 shrink-0"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Join</span>
                </button>
              </div>
              {joinError && (
                <span className="text-[11px] text-rose-500 font-semibold block mt-1.5">
                  {joinError}
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Dashboard Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-600 p-5 rounded-2xl border dark:border-dark-400 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Assigned</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalInterviews}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Calendar className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-600 p-5 rounded-2xl border dark:border-dark-400 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Upcoming & Live</span>
              <p className="text-2xl font-extrabold text-blue-500 mt-1">{upcomingInterviews.length}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Clock className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-600 p-5 rounded-2xl border dark:border-dark-400 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Completed</span>
              <p className="text-2xl font-extrabold text-emerald-500 mt-1">{completedInterviews.length}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-600 p-5 rounded-2xl border dark:border-dark-400 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Resume Status</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 truncate max-w-[110px]">
                {resume ? 'VERIFIED CV' : 'NO CV'}
              </p>
            </div>
            <div className={`h-11 w-11 rounded-xl ${resume ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} flex items-center justify-center`}>
              <FileText className="h-5.5 w-5.5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-slate-200 dark:border-dark-400 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: <Sparkles className="h-4 w-4" /> },
            { id: 'interviews', label: `Assigned Tests (${upcomingInterviews.length})`, icon: <Calendar className="h-4 w-4" /> },
            { id: 'history', label: 'Interview History', icon: <Clock className="h-4 w-4" /> },
            { id: 'profile', label: 'My Profile', icon: <User className="h-4 w-4" /> },
            { id: 'resume', label: 'Resume Manager', icon: <FileText className="h-4 w-4" /> },
            { id: 'analytics', label: 'Analytics & Score', icon: <BarChart2 className="h-4 w-4" /> },
            { id: 'notifications', label: `Notifications (${unreadCount})`, icon: <Bell className="h-4 w-4" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-dark-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-500 border dark:border-dark-400'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT SECTIONS */}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Upcoming / Active Interviews Section */}
              <div className="glass border dark:border-dark-400 p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-500" />
                    <span>Assigned Assessments</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab('interviews')}
                    className="text-xs font-semibold text-brand-500 hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {interviews.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-2xl dark:border-dark-400 text-slate-400">
                    <Calendar className="h-12 w-12 mx-auto stroke-[1.5] mb-3 text-slate-300 dark:text-slate-500" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No scheduled assessments assigned.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      When your recruiter or evaluator schedules a proctored assessment, it will appear here with instructions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviews.slice(0, 3).map((interview) => (
                      <div
                        key={interview.id}
                        className="bg-white dark:bg-dark-600 border dark:border-dark-400 p-5 rounded-2xl shadow-sm hover:border-brand-500/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                              interview.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse' :
                              interview.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}>
                              {interview.status}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">
                              CODE: {interview.code}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                            {interview.title}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-brand-500" />
                              {interview.durationMinutes} Minutes
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-3.5 w-3.5 text-brand-500" />
                              {interview.difficulty || 'MEDIUM'} Difficulty
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                              AI Vision & Audio Monitoring
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                          <span className="text-[11px] text-slate-400 font-medium">
                            Scheduled: {formatDateTime(interview.scheduledStart)}
                          </span>
                          {interview.status !== 'COMPLETED' && (
                            <button
                              onClick={() => navigate(`/room/${interview.code}`)}
                              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <Play className="h-3.5 w-3.5 fill-white" />
                              <span>Start Test</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Proctoring Integrity Checklist */}
              <div className="glass border dark:border-dark-400 p-6 rounded-3xl">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-500" />
                  <span>AI Proctoring Rules & Requirements</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-900/50 border dark:border-dark-400">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Face & Eye Tracking</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">Keep your webcam on and maintain eye gaze towards the screen.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-900/50 border dark:border-dark-400">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Fullscreen Locking</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">Exiting full-screen or switching browser tabs logs a violation count.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-900/50 border dark:border-dark-400">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Audio Decibel Monitoring</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">Ensure a quiet test environment free from external voices or assistance.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-900/50 border dark:border-dark-400">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">YOLO Object Detection</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">Mobile phones, secondary screens, or books in frame trigger automated alerts.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              
              {/* Profile Card Summary */}
              <div className="glass border dark:border-dark-400 p-6 rounded-3xl text-left">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Profile Card</h3>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-xs font-semibold text-brand-500 hover:underline"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {profile?.photo ? (
                    <img src={profile.photo} alt="Avatar" className="h-14 w-14 rounded-2xl object-cover border-2 border-brand-500/30" />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xl border border-brand-500/20">
                      {profile?.firstName ? profile.firstName[0].toUpperCase() : 'C'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {profile?.firstName} {profile?.lastName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-md">
                      Verified Candidate
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t dark:border-dark-400">
                  {profile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                  {profile?.skills && (
                    <div className="pt-2">
                      <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-dark-500 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Widget */}
              <div className="glass border dark:border-dark-400 p-6 rounded-3xl text-left">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Uploaded CV</h3>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="text-xs font-semibold text-brand-500 hover:underline"
                  >
                    Manage Resume
                  </button>
                </div>

                {resume ? (
                  <div className="bg-brand-500/5 border border-brand-500/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-8 w-8 text-brand-500 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                          {resume.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Size: {Math.round(resume.fileSize / 1024)} KB
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-brand-500/10">
                      <button
                        onClick={handleDownloadResume}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-semibold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">No Resume Uploaded</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upload your CV to satisfy candidate qualification requirements.</p>
                    <button
                      onClick={() => setActiveTab('resume')}
                      className="mt-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-all"
                    >
                      Upload CV Now
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 2. ASSIGNED INTERVIEWS TAB */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="glass border dark:border-dark-400 p-6 rounded-3xl">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-brand-500" />
                <span>Assigned Proctored Assessments</span>
              </h2>

              {interviews.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-2xl dark:border-dark-400 text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No assigned tests found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="bg-white dark:bg-dark-600 border dark:border-dark-400 p-6 rounded-3xl shadow-sm hover:border-brand-500/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                            interview.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse' :
                            interview.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}>
                            {interview.status}
                          </span>
                          <button
                            onClick={() => handleCopyCode(interview.code)}
                            className="text-xs font-mono font-bold bg-slate-100 dark:bg-dark-500 hover:bg-slate-200 dark:hover:bg-dark-400 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all"
                          >
                            <span>CODE: {interview.code}</span>
                            {codeCopied === interview.code ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                          </button>
                        </div>

                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                          {interview.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                          {interview.description || 'No specific instructions provided.'}
                        </p>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-dark-900/50 p-3.5 rounded-2xl border dark:border-dark-400 mb-6">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Duration:</span>
                            <span className="font-bold">{interview.durationMinutes} Minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Difficulty:</span>
                            <span className="font-bold text-brand-500">{interview.difficulty || 'MEDIUM'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Scheduled Time:</span>
                            <span className="font-bold">{formatDateTime(interview.scheduledStart)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t dark:border-dark-400">
                        {!resume && (
                          <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            CV Required
                          </span>
                        )}
                        <button
                          onClick={() => navigate(`/room/${interview.code}`)}
                          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                        >
                          <Play className="h-4 w-4 fill-white" />
                          <span>Start Assessment</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. INTERVIEW HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="glass border dark:border-dark-400 p-6 rounded-3xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-6 w-6 text-brand-500" />
                    <span>Assessment History & Audit Logs</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter and inspect completed, cancelled, or expired assessments.
                  </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-48">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search title or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 w-full"
                    />
                  </div>

                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="MISSED">Missed / Expired</option>
                  </select>
                </div>
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-2xl dark:border-dark-400 text-slate-400">
                  <Clock className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-500" />
                  <p className="text-sm font-semibold">No assessment history matching filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b dark:border-dark-400 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Title / Code</th>
                        <th className="py-3 px-4">Scheduled Date</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-dark-400 text-xs">
                      {historyList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-dark-500/50 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                            <div>{item.title}</div>
                            <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                            {formatDateTime(item.scheduledStart)}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                            {item.durationMinutes} mins
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                              item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              item.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {item.status === 'COMPLETED' ? (
                              <button
                                onClick={() => navigate(`/reports/${item.id}`)}
                                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-all"
                              >
                                View Report
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/room/${item.code}`)}
                                className="bg-slate-100 dark:bg-dark-500 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-all"
                              >
                                Open Session
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PROFILE MANAGEMENT TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar & Password Column */}
            <div className="space-y-6">
              
              {/* Profile Photo Upload */}
              <div className="glass border dark:border-dark-400 p-6 rounded-3xl text-center">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">Profile Photo</h3>
                <div className="relative inline-block mb-4">
                  {profileForm.photo ? (
                    <img src={profileForm.photo} alt="Avatar" className="h-28 w-28 rounded-3xl object-cover border-4 border-brand-500/30 mx-auto shadow-md" />
                  ) : (
                    <div className="h-28 w-28 rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-4xl border border-brand-500/20 mx-auto shadow-md">
                      {profileForm.firstName ? profileForm.firstName[0].toUpperCase() : 'C'}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="photo-file" className="cursor-pointer bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-md">
                    Upload New Photo
                  </label>
                  <input type="file" id="photo-file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {profileForm.photo && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-semibold text-rose-500 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Password Change Form */}
              <div className="glass border dark:border-dark-400 p-6 rounded-3xl text-left">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-brand-500" />
                  <span>Security & Password</span>
                </h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {passwordError && <p className="text-[11px] font-semibold text-rose-500">{passwordError}</p>}
                  {passwordMessage && <p className="text-[11px] font-semibold text-emerald-500">{passwordMessage}</p>}

                  <button
                    type="submit"
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md mt-2"
                  >
                    Change Password
                  </button>
                </form>
              </div>

            </div>

            {/* Profile Form Column */}
            <div className="lg:col-span-2">
              <div className="glass border dark:border-dark-400 p-6 md:p-8 rounded-3xl text-left">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-brand-500" />
                  <span>Personal & Professional Qualifications</span>
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  
                  {/* Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1 555-0192"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={profileForm.dob}
                        onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Gender</label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Address & Bio */}
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Residential Address</label>
                    <input
                      type="text"
                      placeholder="City, State, Country"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Professional Bio</label>
                    <textarea
                      rows="3"
                      placeholder="Brief overview of software expertise and career objectives..."
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* Skills & Education */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Technical Skills (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="React, Java, Python, SQL"
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Highest Education</label>
                      <input
                        type="text"
                        placeholder="B.Tech in Computer Science"
                        value={profileForm.education}
                        onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Experience & Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Years of Experience</label>
                      <input
                        type="text"
                        placeholder="3 Years (Senior Fullstack Engineer)"
                        value={profileForm.experience}
                        onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Certifications</label>
                      <input
                        type="text"
                        placeholder="AWS Solutions Architect, Oracle Java Certified"
                        value={profileForm.certifications}
                        onChange={(e) => setProfileForm({ ...profileForm, certifications: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Social & Portfolio Links */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={profileForm.linkedinUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">GitHub Profile</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={profileForm.githubUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Portfolio Website</label>
                      <input
                        type="url"
                        placeholder="https://myportfolio.com"
                        value={profileForm.portfolioUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {profileMessage && <p className="text-xs font-semibold text-emerald-500 pt-2">{profileMessage}</p>}

                  <div className="pt-4 border-t dark:border-dark-400 flex justify-end">
                    <button
                      type="submit"
                      className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md text-xs"
                    >
                      Save Profile Changes
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* 5. RESUME MANAGER TAB */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div className="glass border dark:border-dark-400 p-6 md:p-8 rounded-3xl text-left">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6 text-brand-500" />
                <span>Candidate Resume & Qualification Docs</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload & Management Card */}
                <div className="space-y-6">
                  {resume ? (
                    <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 p-6 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                          <FileCheck className="h-6 w-6" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{resume.fileName}</h4>
                          <span className="text-xs text-slate-400 block">Uploaded file size: {Math.round(resume.fileSize / 1024)} KB</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                        <button
                          onClick={handleDownloadResume}
                          className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => setShowResumePreview(true)}
                          className="bg-slate-100 dark:bg-dark-500 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={handleDeleteResume}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl text-center space-y-2">
                      <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Active CV Found</h4>
                      <p className="text-xs text-slate-500">Upload a PDF or DOCX file to enable evaluators to inspect your resume.</p>
                    </div>
                  )}

                  {/* Upload Drop Zone */}
                  <form onSubmit={handleUploadResume} className="space-y-4">
                    <div className="border-2 border-dashed dark:border-dark-400 rounded-3xl p-8 text-center bg-white/50 dark:bg-dark-600/50 hover:border-brand-500/50 transition-all">
                      <input
                        type="file"
                        id="resume-drop-file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="resume-drop-file" className="cursor-pointer flex flex-col items-center justify-center">
                        <UploadCloud className="h-12 w-12 text-brand-500 mb-3 stroke-[1.5]" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {file ? file.name : 'Click or Drag PDF / DOCX file here'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Maximum allowed size: 10MB</span>
                      </label>
                    </div>

                    {file && (
                      <button
                        type="submit"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-lg shadow-brand-500/20"
                      >
                        Upload & Process Selection
                      </button>
                    )}
                    {uploadStatus && (
                      <p className="text-xs font-semibold text-center text-brand-500 mt-2">{uploadStatus}</p>
                    )}
                  </form>
                </div>

                {/* Parsed Text Preview Card */}
                <div className="bg-slate-50 dark:bg-dark-900/50 border dark:border-dark-400 p-6 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-500" />
                    <span>Parsed AI Text Extraction</span>
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-dark-600 p-4 rounded-xl border dark:border-dark-400 h-64 overflow-y-auto whitespace-pre-wrap">
                    {resume?.parsedText || 'No text extracted yet. Upload a CV to inspect parsed qualifications.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="glass border dark:border-dark-400 p-6 md:p-8 rounded-3xl">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-brand-500" />
                <span>Candidate Evaluation Analytics</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400 text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Overall Integrity Rating</span>
                  <p className="text-3xl font-extrabold text-emerald-500">98.5%</p>
                  <span className="text-[10px] text-slate-400">Low Risk Violation Profile</span>
                </div>
                <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400 text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Average Assessment Score</span>
                  <p className="text-3xl font-extrabold text-brand-500">84.2%</p>
                  <span className="text-[10px] text-slate-400">Based on completed sessions</span>
                </div>
                <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400 text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Test Completion Rate</span>
                  <p className="text-3xl font-extrabold text-blue-500">100%</p>
                  <span className="text-[10px] text-slate-400">Zero unexcused absences</span>
                </div>
              </div>

              {/* Visual Score Bars */}
              <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Competency Breakdown</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Technical Problem Solving</span>
                      <span className="text-brand-500">88%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-dark-500 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full w-[88%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Communication Clarity</span>
                      <span className="text-blue-500">82%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-dark-500 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[82%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>AI Integrity & Focus Index</span>
                      <span className="text-emerald-500">99%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-dark-500 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[99%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="glass border dark:border-dark-400 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-6 w-6 text-brand-500" />
                  <span>Notifications Center ({unreadCount} Unread)</span>
                </h2>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-brand-500 hover:underline"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-2xl dark:border-dark-400 text-slate-400">
                  <Bell className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-500" />
                  <p className="text-sm font-semibold">No notifications right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        item.isRead
                          ? 'bg-white/50 dark:bg-dark-600/50 border-slate-200 dark:border-dark-400'
                          : 'bg-brand-500/5 border-brand-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.isRead ? 'bg-slate-100 dark:bg-dark-500 text-slate-400' : 'bg-brand-500/10 text-brand-500'
                        }`}>
                          <Bell className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{item.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(item.id)}
                            className="text-[10px] font-semibold text-brand-500 hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass border dark:border-dark-400 p-6 md:p-8 rounded-3xl text-left">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6 text-brand-500" />
                <span>Candidate Preferences & Settings</span>
              </h2>

              <div className="space-y-6 max-w-2xl text-xs">
                {/* Theme Preference */}
                <div className="p-4 rounded-2xl border dark:border-dark-400 bg-white dark:bg-dark-600 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Appearance Mode</span>
                    <span className="text-slate-400">Toggle between Light and Dark interface modes</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-slate-100 dark:bg-dark-500 text-slate-800 dark:text-slate-100 font-semibold flex items-center gap-2"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
                    <span className="capitalize">{theme} Mode</span>
                  </button>
                </div>

                {/* Email Notifications */}
                <div className="p-4 rounded-2xl border dark:border-dark-400 bg-white dark:bg-dark-600 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Email Notifications</span>
                    <span className="text-slate-400">Receive email updates for test invitations and score releases</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                    className="h-4 w-4 accent-brand-500 rounded cursor-pointer"
                  />
                </div>

                {/* Account Security */}
                <div className="p-4 rounded-2xl border dark:border-dark-400 bg-white dark:bg-dark-600 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Account Security</span>
                    <span className="text-slate-400">Sign out of active candidate sessions on all devices</span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* RESUME PREVIEW MODAL */}
      {showResumePreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-700 border dark:border-dark-400 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b dark:border-dark-400 pb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" />
                <span>Resume Document Preview</span>
              </h3>
              <button onClick={() => setShowResumePreview(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-dark-900 rounded-xl">
                <span className="font-bold text-slate-400 uppercase block mb-1">File Details</span>
                <p className="font-semibold text-slate-900 dark:text-white">{resume?.fileName}</p>
                <p className="text-slate-500">Size: {Math.round((resume?.fileSize || 0) / 1024)} KB</p>
              </div>

              <span className="font-bold text-slate-400 uppercase block">Extracted Qualifications Text</span>
              <div className="bg-slate-100 dark:bg-dark-900 p-4 rounded-xl font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300 max-h-72 overflow-y-auto border dark:border-dark-400">
                {resume?.parsedText || 'No text extracted.'}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-dark-400 gap-2">
              <button
                onClick={handleDownloadResume}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              >
                Download File
              </button>
              <button
                onClick={() => setShowResumePreview(false)}
                className="bg-slate-200 dark:bg-dark-500 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateDashboard;
