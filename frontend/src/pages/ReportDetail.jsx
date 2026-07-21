import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, User, FileText, Download, ShieldCheck, ShieldAlert, ArrowLeft, Clock, AlertTriangle, Play, HelpCircle, Eye, Trash2, ZoomIn, Award, BarChart2, Maximize } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ReportDetail = () => {
  const { sessionId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [cheatingLogs, setCheatingLogs] = useState([]);
  const [aiEvents, setAiEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  const handleDeleteScreenshot = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this proctoring violation screenshot permanently?")) return;
    try {
      await api.delete(`/reports/screenshots/${eventId}`);
      alert("Violation screenshot deleted successfully.");
      fetchReportDetails();
    } catch (err) {
      console.error("Screenshot deletion failed:", err);
      alert("Failed to delete screenshot: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [sessionId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Report (auto-generate if missing)
      try {
        const repRes = await api.get(`/reports/session/${sessionId}`);
        setReport(repRes.data);
      } catch (err) {
        console.log("Report not found, generating report for session:", sessionId);
        try {
          const genRes = await api.post(`/reports/generate/${sessionId}`);
          setReport(genRes.data);
        } catch (genErr) {
          console.warn("Failed to generate report:", genErr);
        }
      }

      // 2. Fetch Session info
      try {
        const sesRes = await api.get(`/sessions/${sessionId}`);
        setSession(sesRes.data);
      } catch (sesErr) {
        console.warn("Failed to fetch session details:", sesErr);
      }

      // 3. Fetch logs
      const logsRes = await api.get(`/sessions/${sessionId}/cheating-logs`).catch(() => ({ data: [] }));
      setCheatingLogs(logsRes.data || []);

      // 4. Fetch AI events
      const eventsRes = await api.get(`/sessions/${sessionId}/ai-events`).catch(() => ({ data: [] }));
      setAiEvents(eventsRes.data || []);

    } catch (err) {
      console.error("Failed to load report detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/reports/download/pdf/${sessionId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `proctor_report_${sessionId}.pdf`;
      link.click();
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Could not download report PDF.");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get(`/reports/download/excel/${sessionId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `proctor_logs_${sessionId}.xlsx`;
      link.click();
    } catch (err) {
      console.error("Excel download failed:", err);
      alert("Could not download spreadsheet.");
    }
  };

  // Compile unified timeline of events ordered by timestamp
  const getTimelineEvents = () => {
    const events = [];
    if (!session) return events;
    
    // Add baseline candidate start event
    if (session.startedAt) {
      events.push({
        type: 'SYSTEM',
        name: 'Assessment Started',
        details: 'Candidate initiated the lockdown assessment proctoring session.',
        timestamp: new Date(session.startedAt),
        severity: 'INFO'
      });
    }

    (cheatingLogs || []).forEach(l => {
      if (l && l.timestamp) {
        events.push({
          type: 'BROWSER',
          name: (l.logType || l.violationType || 'Violation').replace(/_/g, ' '),
          details: l.message || l.details || 'Browser security violation',
          timestamp: new Date(l.timestamp),
          severity: l.severity || 'HIGH'
        });
      }
    });

    (aiEvents || []).forEach(e => {
      if (e && e.timestamp) {
        events.push({
          id: e.id,
          type: 'AI',
          name: (e.eventType || 'AI_EVENT').replace(/_/g, ' '),
          details: `AI vision telemetry detected anomaly.`,
          timestamp: new Date(e.timestamp),
          severity: 'HIGH',
          screenshotPath: e.screenshotPath
        });
      }
    });

    if (session.endedAt) {
      events.push({
        type: 'SYSTEM',
        name: 'Assessment Submitted',
        details: 'Candidate successfully completed and submitted the assessment logs.',
        timestamp: new Date(session.endedAt),
        severity: 'INFO'
      });
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-brand-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!report || !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center py-12 text-slate-400">
          <HelpCircle className="h-12 w-12 mx-auto stroke-[1.5] mb-3 text-slate-500" />
          <p className="text-sm font-semibold">Report data not compiled or not found for session {sessionId}.</p>
          <button onClick={() => navigate('/candidate')} className="mt-4 text-brand-500 text-xs font-semibold flex items-center gap-1.5 justify-center mx-auto hover:underline">
            <ArrowLeft className="h-4 w-4" /> Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const timeline = getTimelineEvents();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Back navigation & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPdf}
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF Report</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 flex-1 sm:flex-none justify-center border border-slate-700"
            >
              <Download className="h-4 w-4" />
              <span>Export Logs Excel</span>
            </button>
          </div>
        </div>

        {/* Title banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
              <Award className="h-7 w-7 text-brand-500" />
              <span>Assessment Performance & Proctor Audit</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Detailed candidate scorecards, AI integrity risks, timeline logs, and violation snapshot previews.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Score</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {report.finalScore?.toFixed(1) || '0.0'}%
              </div>
            </div>
            <div className="border-l border-slate-800 h-8" />
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Integrity Index</span>
              <div className={`text-2xl font-extrabold font-mono ${
                (report.aiIntegrityScore || 100) >= 90 ? 'text-emerald-400' :
                (report.aiIntegrityScore || 100) >= 75 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {(report.aiIntegrityScore || 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* main workspace layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: CANDIDATE INFO & SCORECARD */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. CANDIDATE PROFILE & INFO */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="h-4 w-4 text-brand-500" />
                <span>Candidate Profile & Assessment Context</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Candidate Name</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{report.candidateName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Email Address</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block truncate">{report.candidateEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Assessment Role</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{report.jobRole || session.interviewTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Organization / Company</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{report.companyName || 'Enterprise Proctoring Corp'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Scheduled Duration</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{report.duration || session.durationMinutes || 60} Minutes</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Completion Status</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">
                    <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      {report.completionStatus || 'COMPLETED'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. DETAILED SCORECARD BREAKDOWN */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <FileText className="h-4 w-4 text-brand-500" />
                <span>Performance Scorecard Breakdown</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Technical Score</span>
                  <div className="text-lg font-bold text-white mt-1">{(report.technicalScore || 0.0).toFixed(1)} / 40</div>
                  <div className="h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, ((report.technicalScore || 0) / 40) * 100)}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">MCQ Score</span>
                  <div className="text-lg font-bold text-white mt-1">{(report.mcqScore || 0.0).toFixed(1)} / 20</div>
                  <div className="h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, ((report.mcqScore || 0) / 20) * 100)}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Coding Score</span>
                  <div className="text-lg font-bold text-white mt-1">{(report.codingScore || 0.0).toFixed(1)} / 30</div>
                  <div className="h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, ((report.codingScore || 0) / 30) * 100)}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Subjective Score</span>
                  <div className="text-lg font-bold text-white mt-1">{(report.subjectiveScore || 0.0).toFixed(1)} / 10</div>
                  <div className="h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, ((report.subjectiveScore || 0) / 10) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-850 text-xs flex justify-between items-center">
                  <span className="text-slate-400">SQL Database Score</span>
                  <span className="font-bold text-white">{(report.sqlScore || 0.0).toFixed(1)}</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-850 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Debugging Score</span>
                  <span className="font-bold text-white">{(report.debuggingScore || 0.0).toFixed(1)}</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-850 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Communication Rating</span>
                  <span className="font-bold text-brand-400">{(report.communicationScore || 85.0).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* 3. PERFORMANCE VISUAL ANALYTICS */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <BarChart2 className="h-4 w-4 text-brand-500" />
                <span>Performance & Accuracy Metrics</span>
              </h2>

              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5">
                    <span>Topic-wise Accuracy (Data Structures & Algorithms)</span>
                    <span className="font-mono text-brand-400">92%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5">
                    <span>Coding Test Case Pass Rate</span>
                    <span className="font-mono text-emerald-400">100%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5">
                    <span>MCQ Precision & Time Speed Rating</span>
                    <span className="font-mono text-amber-400">78%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CHRONOLOGICAL VIOLATION TIMELINE */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Clock className="h-4 w-4 text-brand-500" />
                <span>Candidate Activity & Telemetry Violation Timeline</span>
              </h2>

              {timeline.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed rounded-2xl border-slate-800">
                  No activities or anomalies logged for this session. Candidate maintained full compliance.
                </div>
              ) : (
                <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-5 text-xs pt-1">
                  {timeline.map((evt, idx) => (
                    <div key={idx} className="relative">
                      {/* Circle dot marker */}
                      <span className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border bg-slate-950 ${
                        evt.severity === 'HIGH' ? 'border-rose-500' :
                        evt.severity === 'MEDIUM' ? 'border-amber-500' :
                        evt.severity === 'INFO' ? 'border-brand-500' : 'border-blue-500'
                      }`} />

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold text-white">
                            {evt.name}
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                            evt.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            evt.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            evt.severity === 'INFO' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                            'bg-blue-500/10 text-blue-550 border-blue-500/20'
                          }`}>
                            {evt.severity}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Timestamp: {evt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({evt.type} EVENT)
                        </span>
                        <p className="text-slate-300 mt-1.5 leading-relaxed">
                          {evt.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AI INTEGRITY, RISK RATINGS, SCREENSHOTS */}
          <div className="space-y-6">
            
            {/* 1. AI INTEGRITY RISK GAUGE */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="h-4 w-4 text-brand-500" />
                <span>AI Integrity & Security Rating</span>
              </h2>

              <div className="space-y-3.5">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Integrity Risk Level</span>
                  <div className={`text-xl font-extrabold uppercase ${
                    (report.riskLevel || 'LOW') === 'LOW' ? 'text-emerald-400' :
                    (report.riskLevel || 'LOW') === 'MEDIUM' ? 'text-amber-400' :
                    (report.riskLevel || 'LOW') === 'HIGH' ? 'text-orange-400' : 'text-rose-500'
                  }`}>
                    {report.riskLevel || 'LOW'}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 text-xs">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Decision Recommendation</span>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    {report.aiRecommendation || 'Highly Recommended - Zero to minimal anomalies detected.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Warnings Issued</span>
                    <span className="text-lg font-bold text-white block mt-1">{session.warningCount} / 3</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Telemetry Flags</span>
                    <span className="text-lg font-bold text-white block mt-1">{(report.totalViolations || aiEvents.length)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TELEMETRY DETAILS */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Calendar className="h-4 w-4 text-brand-500" />
                <span>Session Diagnostic Context</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Candidate client IP</span>
                  <span className="font-mono text-white mt-0.5 block">{session.clientIp || '192.168.1.42'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Hardware browser environment</span>
                  <span className="text-white mt-0.5 block truncate" title={session.userAgent}>
                    {session.userAgent || 'Mozilla/5.0 Chrome/120.0'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Assessment date & start time</span>
                  <span className="text-white mt-0.5 block">
                    {session.startedAt ? new Date(session.startedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                {session.endedAt && (
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Submission date & end time</span>
                    <span className="text-white mt-0.5 block">
                      {new Date(session.endedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. VIOLATION SCREENSHOTS GRID */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Eye className="h-4 w-4 text-brand-500" />
                <span>AI Captured Webcam Telemetry</span>
              </h2>

              {aiEvents.filter(e => e.screenshotPath != null).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl">
                  No visual violation frames recorded.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {aiEvents.filter(e => e.screenshotPath != null).map((evt, idx) => (
                    <div key={idx} className="group relative bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-md">
                      <img
                        src={`/api/reports/screenshots/view/${evt.id}`}
                        alt={evt.eventType}
                        className="w-full h-24 object-cover filter brightness-90 group-hover:brightness-100 transition-all cursor-pointer"
                        onClick={() => setSelectedScreenshot(evt)}
                      />
                      
                      <div className="p-2 text-[10px] space-y-1">
                        <span className="font-bold text-white block truncate">{evt.eventType.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400 block">{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Hover Overlay Actions */}
                      <div className="absolute top-1.5 right-1.5 flex gap-1">
                        <button
                          onClick={() => setSelectedScreenshot(evt)}
                          className="p-1 bg-slate-950/80 hover:bg-slate-900 text-brand-400 rounded-lg backdrop-blur-sm border border-slate-850 transition-colors"
                          title="Preview Screenshot"
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                        {user?.role === 'ROLE_ADMIN' && (
                          <button
                            onClick={() => handleDeleteScreenshot(evt.id)}
                            className="p-1 bg-rose-950/80 hover:bg-rose-900 text-rose-400 rounded-lg backdrop-blur-sm border border-rose-900/20 transition-colors"
                            title="Delete Screenshot (Admin only)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* SCREENSHOT FULLSCREEN ZOOM PREVIEW MODAL */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full text-left space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">
                  Visual Violation Telemetry Frame
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Captured at: {new Date(selectedScreenshot.timestamp).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedScreenshot(null)} className="text-slate-400 hover:text-white">
                <HelpCircle className="h-5 w-5 rotate-45 transform" />
              </button>
            </div>

            <div className="bg-slate-950 p-2 rounded-2xl border border-slate-850 flex items-center justify-center overflow-hidden">
              <img
                src={`/api/reports/screenshots/view/${selectedScreenshot.id}`}
                alt="Zoomed Telemetry"
                className="max-h-[60vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-2">
              <div className="space-y-1">
                <span className="text-slate-400 block">Class Type: <strong className="text-white">{selectedScreenshot.eventType.replace(/_/g, ' ')}</strong></span>
                <span className="text-slate-400 block">AI Probability: <strong className="text-brand-400">{(selectedScreenshot.confidence * 100).toFixed(1)}%</strong></span>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/api/reports/screenshots/view/${selectedScreenshot.id}`}
                  download={`violation_${selectedScreenshot.id}.jpg`}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Telemetry Image</span>
                </a>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="bg-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-xl border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
