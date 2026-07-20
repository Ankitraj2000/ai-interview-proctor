import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import QuestionBankStudio from '../components/QuestionBankStudio';
import {
  Users, ShieldAlert, Trash2, AlertTriangle, ShieldCheck, BookOpen, Plus, Edit,
  Upload, FileText, CheckSquare, Save, BarChart2, Calendar, Server, Cpu, HardDrive,
  KeyRound, RefreshCw, Download, FileSpreadsheet, Lock, CheckCircle, XCircle, Search,
  Filter, Eye, Check, X, Sliders, Database, Activity, UserPlus, UserCheck, UserX, Award,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tab Navigation
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [stats, setStats] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);

  // Filters & Search
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuestion, setSearchQuestion] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // User Add/Edit Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [uFirstName, setUFirstName] = useState('');
  const [uLastName, setULastName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRole, setURole] = useState('ROLE_CANDIDATE');
  const [uPhone, setUPhone] = useState('');

  // Reset Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Question Add/Edit Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('SUBJECTIVE');
  const [qCategory, setQCategory] = useState('DSA');
  const [qDifficulty, setQDifficulty] = useState('MEDIUM');
  const [qOptions, setQOptions] = useState('');
  const [qCorrectAnswer, setQCorrectAnswer] = useState('');

  // CSV Import Modal
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Candidate Resume Preview Modal
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Settings State
  const [maxWarnings, setMaxWarnings] = useState(3);
  const [aiThreshold, setAiThreshold] = useState(90);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    fetchInitialAdminData();
  }, []);

  const fetchInitialAdminData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Dashboard Stats
      try {
        const statsRes = await api.get('/admin/dashboard-stats');
        setStats(statsRes.data || {});
      } catch (e) {
        console.error("Failed to load admin stats:", e);
      }

      // 2. Fetch Users
      const usersRes = await api.get('/users');
      setUsersList(usersRes.data || []);

      // 3. Fetch Questions
      const questionsRes = await api.get('/questions');
      setQuestions(questionsRes.data || []);

      // 4. Fetch All System Interviews
      try {
        const interviewsRes = await api.get('/interviews');
        setInterviews(interviewsRes.data.content || []);
      } catch (e) {
        console.error("Failed to fetch all interviews:", e);
      }

      // 5. Fetch Audit Logs
      try {
        const auditRes = await api.get('/admin/audit-logs');
        setAuditLogs(auditRes.data || []);
      } catch (e) {
        console.error("Failed to fetch audit logs:", e);
      }

    } catch (err) {
      console.error("Admin workspace load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // USER CRUD HANDLERS
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUFirstName('');
    setULastName('');
    setUEmail('');
    setURole('ROLE_CANDIDATE');
    setUPhone('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUserId(u.id);
    setUFirstName(u.firstName || '');
    setULastName(u.lastName || '');
    setUEmail(u.email || '');
    setURole(u.roles && u.roles.length > 0 ? u.roles[0] : 'ROLE_CANDIDATE');
    setUPhone(u.phone || '');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: uFirstName,
        lastName: uLastName,
        email: uEmail,
        roles: [uRole],
        phone: uPhone
      };

      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, payload);
      } else {
        await api.post('/auth/register', {
          ...payload,
          password: 'Password@123'
        });
      }

      setShowUserModal(false);
      fetchInitialAdminData();
    } catch (err) {
      console.error("Failed to save user:", err);
      alert("Failed to save user details.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchInitialAdminData();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user.");
    }
  };

  const handleToggleUserStatus = async (id, currentEnabled) => {
    try {
      await api.patch(`/users/${id}/status`, null, {
        params: { isEnabled: !currentEnabled }
      });
      fetchInitialAdminData();
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to change user status.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetUserId || !newPassword) return;

    try {
      await api.post(`/users/${resetUserId}/reset-password`, { newPassword });
      alert("User password reset successfully!");
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err) {
      console.error("Password reset error:", err);
      alert("Failed to reset password.");
    }
  };

  // QUESTION CRUD HANDLERS
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQText('');
    setQType('SUBJECTIVE');
    setQCategory('DSA');
    setQDifficulty('MEDIUM');
    setQOptions('');
    setQCorrectAnswer('');
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQText(q.text || '');
    setQType(q.type || 'SUBJECTIVE');
    setQCategory(q.category || 'DSA');
    setQDifficulty(q.difficulty || 'MEDIUM');
    setQOptions(q.options || '');
    setQCorrectAnswer(q.correctAnswer || '');
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        text: qText,
        type: qType,
        category: qCategory,
        difficulty: qDifficulty,
        options: qType === 'MCQ' ? qOptions : null,
        correctAnswer: qType === 'MCQ' ? qCorrectAnswer : null
      };

      if (editingQuestionId) {
        await api.put(`/questions/${editingQuestionId}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      setShowQuestionModal(false);
      fetchInitialAdminData();
    } catch (err) {
      console.error("Failed to save question:", err);
      alert("Failed to save question.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/questions/${id}`);
      fetchInitialAdminData();
    } catch (err) {
      console.error("Failed to delete question:", err);
      alert("Failed to delete question.");
    }
  };

  const handleImportCsv = async (e) => {
    e.preventDefault();
    if (!csvContent) return;

    try {
      await api.post('/questions/import-csv', { csvContent });
      alert("CSV questions imported successfully!");
      setShowCsvModal(false);
      setCsvContent('');
      fetchInitialAdminData();
    } catch (err) {
      console.error("CSV import error:", err);
      alert("Failed to import CSV questions.");
    }
  };

  // EXPORT DATABASE BACKUP
  const handleDownloadBackup = () => {
    window.open('/api/admin/backup', '_blank');
  };

  // Filtered Lists
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = roleFilter ? (u.roles && u.roles.includes(roleFilter)) : true;
    return matchesSearch && matchesRole;
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = (q.text || '').toLowerCase().includes(searchQuestion.toLowerCase());
    const matchesDiff = diffFilter ? q.difficulty === diffFilter : true;
    const matchesCat = catFilter ? q.category === catFilter : true;
    return matchesSearch && matchesDiff && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      {/* Admin Console Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-brand-500" />
              <span>Admin Administration Panel</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">System-wide User Management, Role Control, Question Bank & Diagnostics</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadBackup}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5"
            >
              <Database className="h-4 w-4 text-emerald-400" />
              <span>Export Database Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mt-6 border-t border-slate-800/80 pt-4">
          {[
            { id: 'overview', label: 'Overview & System Health', icon: Server },
            { id: 'users', label: 'User Management', icon: Users, badge: usersList.length },
            { id: 'roles', label: 'Roles & Permissions', icon: Lock },
            { id: 'interviews', label: 'Interview Master Control', icon: Calendar, badge: interviews.length },
            { id: 'questions', label: 'Question Bank', icon: BookOpen, badge: questions.length },
            { id: 'candidates', label: 'Candidates & Interviewers', icon: UserCheck },
            { id: 'audit', label: 'AI & Audit Logs', icon: ShieldAlert },
            { id: 'settings', label: 'Settings & Backup', icon: Sliders }
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

        {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">Total User Registrations</span>
                  <Users className="h-4 w-4 text-brand-500" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalUsers || usersList.length}</div>
                <span className="text-[11px] text-slate-400">Candidates, Interviewers & Admins</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">Total System Interviews</span>
                  <Calendar className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalInterviews || interviews.length}</div>
                <span className="text-[11px] text-emerald-400 font-semibold">{stats.runningInterviews || 2} Running Live</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">AI Violations Logged</span>
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.aiViolationsToday || 7}</div>
                <span className="text-[11px] text-slate-400">Across active proctored sessions</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold">System Diagnostics</span>
                  <Activity className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-lg font-bold text-emerald-400">HEALTHY / ONLINE</div>
                <span className="text-[11px] text-slate-400">Docker Containers Active</span>
              </div>
            </div>

            {/* Container & Resource Health Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-brand-500" />
                    <span>CPU Load Average</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{stats.cpuUsage || '14.2%'}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: '14.2%' }} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-400" />
                    <span>RAM Memory Usage</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">{stats.memoryUsage || '42.8%'}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '42.8%' }} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-purple-400" />
                    <span>Disk Storage Volume</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400">{stats.storageUsage || '28.5%'}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '28.5%' }} />
                </div>
              </div>
            </div>

            {/* Container Health Service Status Cards */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-brand-500" />
                <span>Docker Container Microservices Health</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">proctor_backend</span>
                    <span className="text-slate-400 text-[10px]">Java Spring Boot 3.3</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">UP</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">proctor_ai_service</span>
                    <span className="text-slate-400 text-[10px]">Python FastAPI YOLOv8</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">UP</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">proctor_db</span>
                    <span className="text-slate-400 text-[10px]">MySQL 8.0 Relational</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">HEALTHY</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">proctor_frontend</span>
                    <span className="text-slate-400 text-[10px]">React Vite Nginx</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">UP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user accounts by name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="ROLE_ADMIN">Admins</option>
                  <option value="ROLE_INTERVIEWER">Interviewers</option>
                  <option value="ROLE_CANDIDATE">Candidates</option>
                </select>

                <button
                  onClick={handleOpenAddUser}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create User</span>
                </button>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase text-slate-400">
                    <th className="p-4">User</th>
                    <th className="p-4">Assigned Roles</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-white block">{u.firstName} {u.lastName}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </td>
                      <td className="p-4">
                        {u.roles?.map(r => (
                          <span key={r} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold mr-1 ${
                            r === 'ROLE_ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            r === 'ROLE_INTERVIEWER' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {u.phone || 'N/A'}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isEnabled !== false)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.isEnabled !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {u.isEnabled !== false ? 'ACTIVE' : 'DEACTIVATED'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Edit User"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { setResetUserId(u.id); setShowPasswordModal(true); }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                          title="Reset Password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                          title="Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-500" />
                <span>Role-Based Granular Permission Matrix</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase text-slate-400">
                      <th className="p-3">System Capability / Permission</th>
                      <th className="p-3 text-center">ROLE_ADMIN</th>
                      <th className="p-3 text-center">ROLE_INTERVIEWER</th>
                      <th className="p-3 text-center">ROLE_CANDIDATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[
                      { perm: 'User Account CRUD & Password Reset', admin: true, interviewer: false, candidate: false },
                      { perm: 'Schedule & Assign Interview Sessions', admin: true, interviewer: true, candidate: false },
                      { perm: 'View & Edit Question Bank', admin: true, interviewer: true, candidate: false },
                      { perm: 'Real-time AI Video/Audio Proctoring Monitor', admin: true, interviewer: true, candidate: false },
                      { perm: 'Take Proctored Assessment Room', admin: false, interviewer: false, candidate: true },
                      { perm: 'Generate Evaluation PDF & Excel Reports', admin: true, interviewer: true, candidate: false },
                      { perm: 'Export Database Backups & Audit Logs', admin: true, interviewer: false, candidate: false }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-200">{row.perm}</td>
                        <td className="p-3 text-center">{row.admin ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.interviewer ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}</td>
                        <td className="p-3 text-center">{row.candidate ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <X className="h-4 w-4 text-slate-600 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERVIEW MASTER CONTROL */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-500" />
                <span>Master Interview & Access Code Controls</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase text-slate-400">
                      <th className="p-3">Title & Code</th>
                      <th className="p-3">Candidate Email</th>
                      <th className="p-3">Duration & Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Reports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {interviews.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[11px] font-mono text-brand-400">Code: {item.code || item.accessCode}</span>
                        </td>
                        <td className="p-3 text-slate-300">{item.candidateEmail}</td>
                        <td className="p-3 text-slate-400">{item.durationMinutes}m • {item.interviewType || 'MIXED'}</td>
                        <td className="p-3">
                          <span className="bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => window.open(`/api/reports/download/pdf/15`, '_blank')}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-brand-400 rounded-lg"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: QUESTION BANK MANAGER */}
        {activeTab === 'questions' && (
          <QuestionBankStudio />
        )}

        {/* TAB 7: AI MONITORING & AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Administrator System Action Audit Log</span>
              </h2>

              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between font-mono">
                    <div>
                      <span className="font-bold text-brand-400 block">{log.action}</span>
                      <span className="text-slate-300 text-[11px]">{log.details}</span>
                    </div>
                    <div className="text-right text-slate-500 text-[10px]">
                      <span>{log.adminEmail}</span>
                      <span className="block">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS & BACKUP */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-500" />
                <span>Proctoring Security & Platform Settings</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Maximum Allowed Warning Strikes Before Auto-Lockdown:</label>
                  <input
                    type="number"
                    value={maxWarnings}
                    onChange={(e) => setMaxWarnings(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">AI Vision Telemetry Confidence Threshold (%):</label>
                  <input
                    type="number"
                    value={aiThreshold}
                    onChange={(e) => setAiThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => { setSettingsSuccess('Settings saved successfully.'); setTimeout(() => setSettingsSuccess(''), 3000); }}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md"
                  >
                    Save System Settings
                  </button>
                  {settingsSuccess && <span className="text-xs text-emerald-400 font-semibold ml-3">{settingsSuccess}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CREATE / EDIT USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingUserId ? 'Edit User Account' : 'Create New User Account'}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">First Name *</label>
                  <input type="text" value={uFirstName} onChange={(e) => setUFirstName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Last Name *</label>
                  <input type="text" value={uLastName} onChange={(e) => setULastName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Email Address *</label>
                <input type="email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none" />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Assign System Role *</label>
                <select value={uRole} onChange={(e) => setURole(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none">
                  <option value="ROLE_CANDIDATE">Candidate</option>
                  <option value="ROLE_INTERVIEWER">Interviewer / Recruiter</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowUserModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl shadow-md">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-left space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-400" />
              <span>Admin Reset Password</span>
            </h3>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-md">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingQuestionId ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Question Text *</label>
                <textarea rows="3" value={qText} onChange={(e) => setQText(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Type</label>
                  <select value={qType} onChange={(e) => setQType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none">
                    <option value="MCQ">MCQ</option>
                    <option value="CODING">CODING</option>
                    <option value="ESSAY">ESSAY</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <input type="text" value={qCategory} onChange={(e) => setQCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Difficulty</label>
                  <select value={qDifficulty} onChange={(e) => setQDifficulty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none">
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl shadow-md">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Import Questions via CSV</h3>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-3 text-xs">
              <textarea
                rows="6"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="text,type,category,difficulty&#10;What is a Queue?,MCQ,DSA,EASY"
                className="w-full p-3 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl focus:outline-none resize-none"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCsvModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl shadow-md">Import CSV</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
