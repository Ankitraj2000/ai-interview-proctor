import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search, Plus, Edit, Trash2, Copy, Archive, CheckCircle, RefreshCw, Upload,
  Download, FileText, Settings, X, PlusCircle, Check, BookOpen, Layers,
  LayoutTemplate, ArrowUpRight, HelpCircle, Trash, Code, Database, AlertCircle
} from 'lucide-react';

const QuestionBankStudio = () => {
  const [subTab, setSubTab] = useState('questions'); // questions, sets, templates

  // Data Lists
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [archivedFilter, setArchivedFilter] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  // Multi-Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Loading / Telemetry States
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Editing Entity Form States
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingSet, setEditingSet] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Import Forms
  const [importType, setImportType] = useState('csv');
  const [importContent, setImportContent] = useState('');

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Questions
      const questionsRes = await api.get('/questions', {
        params: {
          category: catFilter || null,
          difficulty: diffFilter || null,
          type: typeFilter || null,
          search: search || null,
          archived: archivedFilter
        }
      });
      setQuestions(questionsRes.data || []);

      // Fetch Categories
      const categoriesRes = await api.get('/questions/categories');
      setCategories(categoriesRes.data || []);

      // Fetch Question Sets
      const setsRes = await api.get('/question-sets');
      setQuestionSets(setsRes.data || []);

      // Fetch Templates
      const templatesRes = await api.get('/interview-templates');
      setTemplates(templatesRes.data || []);

    } catch (e) {
      console.error("Failed to load Question Bank Studio data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [catFilter, diffFilter, typeFilter, search, archivedFilter, subTab]);

  // Bulk Multi-Select Helpers
  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q.id));
    }
  };

  // Question CRUD Operations
  const handleOpenAddQuestion = () => {
    setEditingQuestion({
      title: '',
      text: '',
      type: 'MCQ',
      category: 'Data Structures',
      difficulty: 'MEDIUM',
      topic: 'Arrays',
      estimatedTimeMinutes: 10,
      marks: 10,
      negativeMarks: 0.0,
      options: '',
      correctAnswer: '',
      mcqType: 'SINGLE',
      starterCode: '',
      constraints: '',
      explanation: '',
      imageUrl: '',
      codeSnippet: '',
      minWords: 0,
      maxWords: 1000,
      evaluationType: 'AUTO',
      testCases: []
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion({ ...q });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion.id) {
        await api.put(`/questions/${editingQuestion.id}`, editingQuestion);
        showToast('Question updated successfully!');
      } else {
        await api.post('/questions', editingQuestion);
        showToast('Question created successfully!');
      }
      setShowQuestionModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to save question: " + err.message);
    }
  };

  const handleDuplicateQuestion = async (id) => {
    try {
      await api.post(`/questions/${id}/duplicate`);
      showToast('Question duplicated successfully!');
      fetchData();
    } catch (err) {
      alert("Duplicate failed: " + err.message);
    }
  };

  const handleArchiveQuestion = async (id) => {
    try {
      await api.post(`/questions/${id}/archive`);
      showToast('Question archived successfully!');
      fetchData();
    } catch (err) {
      alert("Archive failed: " + err.message);
    }
  };

  const handleRestoreQuestion = async (id) => {
    try {
      await api.post(`/questions/${id}/restore`);
      showToast('Question restored successfully!');
      fetchData();
    } catch (err) {
      alert("Restore failed: " + err.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question permanently?")) return;
    try {
      await api.delete(`/questions/${id}`);
      showToast('Question deleted permanently!');
      fetchData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete all ${selectedIds.length} selected questions?`)) return;
    try {
      await api.post('/questions/bulk-delete', selectedIds);
      showToast('Bulk delete executed!');
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      alert("Bulk delete failed: " + err.message);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await api.post(`/questions/${id}/archive`);
      }
      showToast('Bulk archive executed!');
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      alert("Bulk archive failed: " + err.message);
    }
  };

  const handleBulkExport = () => {
    const idsParam = selectedIds.join(',');
    window.open(`/api/questions/export?format=csv&category=${catFilter}&difficulty=${diffFilter}&type=${typeFilter}`, '_blank');
  };

  // Bulk Import
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importContent) return;
    try {
      if (importType === 'json') {
        await api.post('/questions/import-json', importContent, {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        await api.post('/questions/import', importContent, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      showToast('Questions imported successfully!');
      setShowImportModal(false);
      setImportContent('');
      fetchData();
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };

  // Question Set Actions
  const handleOpenAddSet = () => {
    setEditingSet({
      name: '',
      description: '',
      category: 'General',
      difficulty: 'MEDIUM',
      durationMinutes: 60,
      passingMarks: 40,
      totalMarks: 100,
      randomizeOrder: true,
      questions: []
    });
    setShowSetModal(true);
  };

  const handleSaveSet = async (e) => {
    e.preventDefault();
    try {
      await api.post('/question-sets', editingSet);
      showToast('Question Set saved successfully!');
      setShowSetModal(false);
      fetchData();
    } catch (err) {
      alert("Set save failed: " + err.message);
    }
  };

  const handleCloneSet = async (id) => {
    try {
      await api.post(`/question-sets/${id}/clone`);
      showToast('Question Set cloned successfully!');
      fetchData();
    } catch (err) {
      alert("Clone failed: " + err.message);
    }
  };

  const handleDeleteSet = async (id) => {
    if (!window.confirm("Permanently delete this question set?")) return;
    try {
      await api.delete(`/question-sets/${id}`);
      showToast('Question Set deleted!');
      fetchData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Random Question Set Generator
  const [randomParams, setRandomParams] = useState({
    name: 'Auto Generated Assessment Set',
    category: 'Data Structures',
    difficulty: 'MEDIUM',
    type: 'CODING',
    count: 5,
    duration: 60
  });

  const handleGenerateRandomSet = async (e) => {
    e.preventDefault();
    try {
      await api.post('/question-sets/generate-random', randomParams);
      showToast('Random assessment set generated!');
      setShowRandomModal(false);
      fetchData();
    } catch (err) {
      alert("Generation failed: " + err.message);
    }
  };

  // Interview Template Actions
  const handleOpenAddTemplate = () => {
    setEditingTemplate({
      name: '',
      description: '',
      category: 'Java',
      difficulty: 'MEDIUM',
      durationMinutes: 60,
      interviewType: 'FULL_STACK',
      questionSetId: questionSets[0]?.id || '',
      enableAiProctoring: true,
      enableBrowserLock: true,
      enableWebcam: true,
      enableMicrophone: true
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/interview-templates', editingTemplate);
      showToast('Template saved successfully!');
      setShowTemplateModal(false);
      fetchData();
    } catch (err) {
      alert("Template save failed: " + err.message);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Delete this interview template?")) return;
    try {
      await api.delete(`/interview-templates/${id}`);
      showToast('Template deleted successfully!');
      fetchData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Toast Notifier Helper
  const showToast = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Sort helper
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-2 rounded-2xl max-w-lg">
        <button
          onClick={() => setSubTab('questions')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'questions' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Centralized Question Bank</span>
        </button>
        <button
          onClick={() => setSubTab('sets')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'sets' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Question Sets</span>
        </button>
        <button
          onClick={() => setSubTab('templates')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'templates' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutTemplate className="h-4 w-4" />
          <span>Interview Templates</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* --------------------- SUBTAB: QUESTIONS --------------------- */}
      {subTab === 'questions' && (
        <div className="space-y-4">
          {/* Filters & Control Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by text, title or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <select
                value={diffFilter}
                onChange={(e) => setDiffFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="SUBJECTIVE">SUBJECTIVE</option>
                <option value="CODING">CODING</option>
                <option value="SQL">SQL</option>
                <option value="DEBUGGING">DEBUGGING</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={archivedFilter}
                  onChange={(e) => setArchivedFilter(e.target.checked)}
                  className="rounded accent-brand-500"
                />
                <span>Show Archived</span>
              </label>

              <button
                onClick={() => setShowImportModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Bulk Import</span>
              </button>

              <button
                onClick={handleBulkExport}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Bank</span>
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Actions Panel */}
          {selectedIds.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-400">{selectedIds.length} questions selected</span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkArchive}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-750"
                >
                  Bulk Archive
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 font-bold"
                >
                  Bulk Delete
                </button>
              </div>
            </div>
          )}

          {/* Question Grid/Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase text-slate-400">
                  <th className="p-4 w-8">
                    <input
                      type="checkbox"
                      checked={questions.length > 0 && selectedIds.length === questions.length}
                      onChange={handleSelectAll}
                      className="accent-brand-500 rounded"
                    />
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('title')}>Question Title / Topic</th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('type')}>Type</th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('category')}>Category</th>
                  <th className="p-4 cursor-pointer text-center" onClick={() => handleSort('marks')}>Marks</th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('difficulty')}>Difficulty</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
                      <span>Syncing Question Bank database...</span>
                    </td>
                  </tr>
                ) : sortedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No matching questions found in this scope. Add a question to get started.
                    </td>
                  </tr>
                ) : (
                  sortedQuestions.map(q => (
                    <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(q.id)}
                          onChange={() => handleSelectRow(q.id)}
                          className="accent-brand-500 rounded"
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white block max-w-sm truncate">{q.title || q.text.substring(0, 40) + '...'}</span>
                        <span className="text-[10px] text-slate-400 block max-w-sm truncate mt-0.5">{q.text}</span>
                        <span className="text-[10px] font-semibold text-brand-400/90 mt-1 block">Topic: {q.topic || 'General'}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {q.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{q.category}</td>
                      <td className="p-4 text-center font-mono font-bold text-slate-200">{q.marks || 10}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          q.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          q.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg"
                          title="Edit Question"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateQuestion(q.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-brand-400 rounded-lg"
                          title="Duplicate Question"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {q.isArchived ? (
                          <button
                            onClick={() => handleRestoreQuestion(q.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-lg"
                            title="Restore"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchiveQuestion(q.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-amber-400 rounded-lg"
                            title="Archive"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/40 text-rose-400 rounded-lg"
                          title="Delete Permanently"
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

      {/* --------------------- SUBTAB: SETS --------------------- */}
      {subTab === 'sets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl">
            <span className="text-xs text-slate-400 font-medium">Design modular evaluation question sets or auto-assemble via Random Generator.</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRandomModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-500/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Random Generator</span>
              </button>
              <button
                onClick={handleOpenAddSet}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>Create Question Set</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {questionSets.map(set => (
              <div key={set.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {set.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      set.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400' :
                      set.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {set.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{set.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{set.description || 'No description provided.'}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-3.5 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold font-mono">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">QUESTIONS</span>
                      <span className="text-white text-xs mt-0.5 block">{set.totalQuestions || set.questions?.length || 0}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">TOTAL MARKS</span>
                      <span className="text-brand-450 text-xs mt-0.5 block">{set.totalMarks || 100}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">DURATION</span>
                      <span className="text-purple-400 text-xs mt-0.5 block">{set.durationMinutes || 60}m</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 text-[11px]">
                    <button
                      onClick={() => handleCloneSet(set.id)}
                      className="bg-slate-800 hover:bg-slate-750 text-brand-400 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Clone</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSet(set.id)}
                      className="bg-slate-800 hover:bg-rose-950/40 text-rose-400 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------- SUBTAB: TEMPLATES --------------------- */}
      {subTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl">
            <span className="text-xs text-slate-400 font-medium">Define interview template schedules (e.g. Java Dev, MERN stack) for 1-Click scheduling.</span>
            <button
              onClick={handleOpenAddTemplate}
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {tmpl.interviewType}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">{tmpl.category}</span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{tmpl.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{tmpl.description || 'Predefined evaluation blueprint.'}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Duration Limit:</span>
                    <span className="text-slate-200 font-bold font-mono">{tmpl.durationMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AI Proctoring Check:</span>
                    <span className={tmpl.enableAiProctoring ? "text-emerald-400 font-bold" : "text-slate-500 font-bold"}>
                      {tmpl.enableAiProctoring ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Browser Lockout:</span>
                    <span className={tmpl.enableBrowserLock ? "text-emerald-400 font-bold" : "text-slate-500 font-bold"}>
                      {tmpl.enableBrowserLock ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                    <button
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="bg-slate-850 hover:bg-rose-950/40 text-rose-400 px-3 py-1.5 rounded-lg border border-slate-750 text-[10px] font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------- MODAL: ADD / EDIT QUESTION --------------------- */}
      {showQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full text-left space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingQuestion.id ? 'Modify Question Parameters' : 'Add Question to Bank'}</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Question Title / Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.title}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                    placeholder="e.g. Reverse Array In-Place"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Question Type *</label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="SUBJECTIVE">SUBJECTIVE (Essay/Conceptual)</option>
                    <option value="CODING">CODING (Compiler Verified)</option>
                    <option value="SQL">SQL (Database Schema Queries)</option>
                    <option value="DEBUGGING">DEBUGGING (Fix Faulty Logic)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Core Description / Instructions *</label>
                <textarea
                  rows="3"
                  required
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                  placeholder="Enter detailed question statement..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    value={editingQuestion.category}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Topic</label>
                  <input
                    type="text"
                    value={editingQuestion.topic}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Difficulty</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Target Marks</label>
                  <input
                    type="number"
                    value={editingQuestion.marks}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Type-Specific Options Rendering */}
              {editingQuestion.type === 'MCQ' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <span className="font-bold text-brand-400 block border-b border-slate-850 pb-1.5">MCQ Options Configuration</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Select Mode</label>
                      <select
                        value={editingQuestion.mcqType}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, mcqType: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg"
                      >
                        <option value="SINGLE">Single Choice Correct</option>
                        <option value="MULTIPLE">Multiple Choices Correct</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Code Snippet (Optional)</label>
                      <textarea
                        rows="1"
                        value={editingQuestion.codeSnippet}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, codeSnippet: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg font-mono"
                        placeholder="Paste code block snippet..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Comma Separated Options *</label>
                    <input
                      type="text"
                      required
                      value={editingQuestion.options}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, options: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg"
                      placeholder="Option A,Option B,Option C,Option D"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Correct Answer Value *</label>
                    <input
                      type="text"
                      required
                      value={editingQuestion.correctAnswer}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg"
                      placeholder="e.g. Option B"
                    />
                  </div>
                </div>
              )}

              {editingQuestion.type === 'SUBJECTIVE' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Min Word Constraint</label>
                    <input
                      type="number"
                      value={editingQuestion.minWords}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, minWords: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Max Word Constraint</label>
                    <input
                      type="number"
                      value={editingQuestion.maxWords}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, maxWords: parseInt(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg font-mono"
                    />
                  </div>
                </div>
              )}

              {editingQuestion.type === 'CODING' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <span className="font-bold text-brand-400 block border-b border-slate-850 pb-1.5">Compiler Starter Code & Constraints</span>
                  <div>
                    <label className="text-slate-300 block mb-1">Starter Code Template</label>
                    <textarea
                      rows="3"
                      value={editingQuestion.starterCode}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, starterCode: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg font-mono"
                      placeholder="def reverse_string(s):&#10;    pass"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Constraints</label>
                    <input
                      type="text"
                      value={editingQuestion.constraints}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, constraints: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg"
                      placeholder="e.g. 1 <= len(s) <= 10^5"
                    />
                  </div>
                </div>
              )}

              {editingQuestion.type === 'SQL' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <span className="font-bold text-brand-400 block border-b border-slate-850 pb-1.5">SQL Database Schema Blueprint</span>
                  <div>
                    <label className="text-slate-300 block mb-1">Table Creation DDL / Schema JSON</label>
                    <textarea
                      rows="3"
                      value={editingQuestion.starterCode}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, starterCode: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg font-mono"
                      placeholder="CREATE TABLE employees (id INT, name VARCHAR(50));"
                    />
                  </div>
                </div>
              )}

              {editingQuestion.type === 'DEBUGGING' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <span className="font-bold text-brand-400 block border-b border-slate-850 pb-1.5">Debugging Defective Code Segment</span>
                  <div>
                    <label className="text-slate-300 block mb-1">Faulty Code (Buggy Code Input)</label>
                    <textarea
                      rows="3"
                      value={editingQuestion.starterCode}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, starterCode: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg font-mono"
                      placeholder="for i in range(10):&#10;print(i) # Indentation Bug"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Solution Explanation & Evaluation Criteria</label>
                <textarea
                  rows="2"
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                  placeholder="Solution criteria for recruiter grading..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------- MODAL: BULK IMPORT --------------------- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Bulk Import Questions</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Payload Format Type</label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                >
                  <option value="csv">CSV (Comma-Separated Text)</option>
                  <option value="json">JSON Array Format</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Text Data Content *</label>
                <textarea
                  rows="8"
                  required
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl focus:outline-none resize-none"
                  placeholder={importType === 'csv' ?
                    'title,text,type,category,difficulty,options,correct_answer\nQueue MCQ,FIFO Queue concept,MCQ,Data Structures,EASY,"Stack,Queue,Tree,Graph",Queue' :
                    '[\n  {\n    "title": "SQL Join",\n    "text": "Join tables...",\n    "type": "SQL",\n    "category": "SQL",\n    "difficulty": "EASY"\n  }\n]'
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowImportModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow-md">Import Questions</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------- MODAL: RANDOM SET GENERATOR --------------------- */}
      {showRandomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Generate Random Question Set</h3>
              <button onClick={() => setShowRandomModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleGenerateRandomSet} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Set Name *</label>
                <input
                  type="text"
                  required
                  value={randomParams.name}
                  onChange={(e) => setRandomParams({ ...randomParams, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Category Target</label>
                  <select
                    value={randomParams.category}
                    onChange={(e) => setRandomParams({ ...randomParams, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Difficulty Target</label>
                  <select
                    value={randomParams.difficulty}
                    onChange={(e) => setRandomParams({ ...randomParams, difficulty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Question Type</label>
                  <select
                    value={randomParams.type}
                    onChange={(e) => setRandomParams({ ...randomParams, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                  >
                    <option value="">Mixed Types</option>
                    <option value="MCQ">MCQ Only</option>
                    <option value="CODING">Coding Only</option>
                    <option value="SUBJECTIVE">Subjective</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Question Count</label>
                  <input
                    type="number"
                    value={randomParams.count}
                    onChange={(e) => setRandomParams({ ...randomParams, count: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={randomParams.duration}
                    onChange={(e) => setRandomParams({ ...randomParams, duration: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowRandomModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl shadow-md">Generate Set</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------- MODAL: ADD / EDIT TEMPLATE --------------------- */}
      {showTemplateModal && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create Interview Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                  placeholder="e.g. Senior Java Backend Developer"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Category Blueprint *</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Interview Type</label>
                  <select
                    value={editingTemplate.interviewType}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, interviewType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                  >
                    <option value="FULL_STACK">Full Stack</option>
                    <option value="CODING_INTERVIEW">Coding Assessment</option>
                    <option value="SUBJECTIVE">Conceptual (Subjective)</option>
                    <option value="MCQ">MCQ Screening</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={editingTemplate.durationMinutes}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, durationMinutes: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Assigned Question Set</label>
                <select
                  value={editingTemplate.questionSetId}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, questionSetId: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:outline-none"
                >
                  <option value="">No set (Dynamic random questions)</option>
                  {questionSets.map(set => <option key={set.id} value={set.id}>{set.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-[10px] font-bold">
                <label className="flex items-center gap-1.5 text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTemplate.enableAiProctoring}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, enableAiProctoring: e.target.checked })}
                    className="rounded accent-brand-500"
                  />
                  <span>AI Webcam Proctoring</span>
                </label>

                <label className="flex items-center gap-1.5 text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTemplate.enableBrowserLock}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, enableBrowserLock: e.target.checked })}
                    className="rounded accent-brand-500"
                  />
                  <span>Lock Browser Window</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow-md">Create Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankStudio;
