import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import api from '../services/api';
import CameraStream from '../components/CameraStream';
import CodeEditor from '../components/CodeEditor';
import WarningOverlay from '../components/WarningOverlay';
import {
  Play, AlertTriangle, ShieldCheck, Clock, HelpCircle, CheckSquare,
  CheckCircle, XCircle, ArrowLeft, ArrowRight, Eye, Video, Mic, Wifi,
  Monitor, Maximize, AlertCircle, FileText, Check, Lock, RefreshCw,
  ChevronRight, ChevronLeft, Menu, X, Award, BarChart2, ShieldAlert
} from 'lucide-react';

const InterviewRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Core Assessment States
  const [interview, setInterview] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inTestRoom, setInTestRoom] = useState(false);

  // Pre-Interview System Checklist
  const [checklist, setChecklist] = useState({
    webcam: false,
    mic: false,
    browser: true,
    resolution: true,
    network: true,
    fullscreen: false
  });
  const [systemChecking, setSystemChecking] = useState(false);

  // Timer & Countdown
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [timerWarning, setTimerWarning] = useState('');

  // Questions & Navigation
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [autoSavedTime, setAutoSavedTime] = useState('');

  // Strict Proctor Violation & Warning System
  const [warningMsg, setWarningMsg] = useState('');
  const [warningType, setWarningType] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [suspended, setSuspended] = useState(false);
  const [violations, setViolations] = useState([]);

  // Browser Security & Fullscreen Tracking
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

  // Real-time AI Telemetry Drawer
  const [aiEvents, setAiEvents] = useState([]);
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  // Network Offline Recovery
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Final Submission Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ref map for strike cooldown per violation type (3 seconds per violation category)
  const lastViolationMapRef = useRef({});

  // Centralized Violation Trigger & Strike Count Enforcer
  const triggerViolation = async (type, message) => {
    if (!session || suspended) return;

    const now = Date.now();
    const lastTime = lastViolationMapRef.current[type] || 0;
    if (now - lastTime < 3000) return; // 3 seconds cooldown per specific violation type
    lastViolationMapRef.current[type] = now;

    const newViolation = { id: now, type, details: message, time: new Date().toLocaleTimeString() };
    setViolations(prev => [newViolation, ...prev]);

    setWarningType(type);
    setWarningMsg(message);
    setShowWarning(true);

    setWarningCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setSuspended(true);
        stopProctoring();
        stopCamera();
      }
      return newCount;
    });

    // Log to backend Spring Boot
    try {
      if (type.startsWith('PHONE_') || type.startsWith('CAMERA_') || type.startsWith('FACE_') || type.startsWith('MULTIPLE_')) {
        await api.post(`/sessions/${session.id}/ai-event`, null, {
          params: { eventType: type, confidence: 0.95 }
        });
      } else {
        await api.post(`/sessions/${session.id}/violation`, null, {
          params: { violationType: type, details: message }
        });
      }
    } catch (err) {
      console.error("Failed to log violation to backend:", err);
    }
  };

  // WebRTC Telemetry Callback from FastAPI AI Microservice
  const handleTelemetry = async (data) => {
    if (!session || suspended) return;
    const { events_flagged, cheating_score } = data;

    if (events_flagged && events_flagged.length > 0) {
      for (const event of events_flagged) {
        let type = event;
        let desc = 'AI anomaly detected in proctored camera stream.';

        if (event === 'PHONE_DETECTED') {
          desc = 'Mobile phone or unauthorized device detected in video feed.';
        } else if (event === 'MULTIPLE_PEOPLE') {
          desc = 'Multiple faces detected in camera frame.';
        } else if (event === 'FACE_MISSING') {
          desc = 'Candidate face was not found in camera window.';
        } else if (event === 'CAMERA_BLOCKED') {
          desc = 'Webcam shutter is closed, lens is covered, or screen is dark!';
        } else if (event === 'CAMERA_FROZEN' || event === 'STATIC_IMAGE_ATTACK') {
          desc = 'Camera video feed is frozen or static image detected!';
        } else if (event === 'LOOKING_AWAY') {
          desc = 'Candidate gaze indicates looking away from screen.';
        } else if (event === 'SUSPICIOUS_AUDIO') {
          desc = 'Suspicious secondary audio or talk activity detected.';
        }

        const newAiEvent = {
          id: Date.now(),
          type,
          severity: ['PHONE_DETECTED', 'CAMERA_BLOCKED', 'MULTIPLE_PEOPLE', 'FACE_MISSING'].includes(event) ? 'HIGH' : 'MEDIUM',
          desc,
          time: new Date().toLocaleTimeString(),
          confidence: '95%'
        };

        setAiEvents(prev => [newAiEvent, ...prev]);

        // Trigger Strike & Warning Overlay for Critical AI Flags!
        if (['PHONE_DETECTED', 'CAMERA_BLOCKED', 'CAMERA_FROZEN', 'STATIC_IMAGE_ATTACK', 'MULTIPLE_PEOPLE', 'FACE_MISSING'].includes(event)) {
          triggerViolation(type, desc);
        }
      }
    }
  };

  const {
    stream,
    videoRef,
    canvasRef,
    wsConnected,
    startCamera,
    stopCamera,
    startProctoring,
    stopProctoring
  } = useWebRTC(handleTelemetry);

  // Auto-sync videoRef stream object when entering test room
  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.warn("Video stream play failed:", err));
    }
  }, [inTestRoom, stream]);

  // Load Interview Configuration
  useEffect(() => {
    fetchInterviewDetails();
  }, [code]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/interviews/code/${code}`);
      const data = res.data;
      setInterview(data);
      setTimeLeft((data.durationMinutes || 30) * 60);

      // Load questions from question set or API
      let loadedQuestions = data.questions;
      if (!loadedQuestions || loadedQuestions.length === 0) {
        try {
          const qRes = await api.get(`/interviews/${data.id}/questions`);
          loadedQuestions = qRes.data;
        } catch (e) {
          console.warn("Could not load dynamic questions endpoint:", e);
        }
      }

      if (loadedQuestions && loadedQuestions.length > 0) {
        setQuestions(loadedQuestions);
      } else {
        // Seed DB Question Fallbacks (Real DB IDs: 4, 5, 7)
        setQuestions([
          {
            id: 4,
            text: 'What is the average time complexity of searching in a balanced binary search tree?',
            type: 'MCQ',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correctAnswer: 'O(log n)',
            marks: 5
          },
          {
            id: 5,
            text: 'Which of the following is NOT one of the 5 SOLID principles?',
            type: 'MCQ',
            options: ['Single Responsibility', 'Open Closed', 'Interface Segregation', 'Multiple Inheritance'],
            correctAnswer: 'Multiple Inheritance',
            marks: 5
          },
          {
            id: 7,
            text: 'Write a function `reverse_array(arr)` that returns the reversed array without using built-in `.reverse()`.',
            type: 'CODING',
            language: 'python',
            marks: 15
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load interview config:", err);
      alert("Error loading assessment: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Run Pre-Interview System Diagnostics
  const runSystemCheck = async () => {
    setSystemChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());

      const resOk = window.innerWidth >= 1024;
      const fsOk = document.fullscreenEnabled || document.webkitFullscreenEnabled;

      setChecklist({
        webcam: true,
        mic: true,
        browser: true,
        resolution: resOk,
        network: true,
        fullscreen: !!fsOk
      });
    } catch (err) {
      console.error("Media permission check failed:", err);
      alert("Camera or Microphone access denied. Please grant permissions in your browser.");
    } finally {
      setSystemChecking(false);
    }
  };

  // Enter Test Room Handler
  const handleEnterTestRoom = async () => {
    try {
      setLoading(true);

      let currentSession = session;
      const savedSessionStr = localStorage.getItem(`session_${interview.id}`);
      if (savedSessionStr && !currentSession) {
        try {
          currentSession = JSON.parse(savedSessionStr);
          setSession(currentSession);
        } catch {}
      }

      if (!currentSession) {
        const sessionRes = await api.post(`/sessions/start/${interview.id}`);
        currentSession = sessionRes.data;
        setSession(currentSession);
        localStorage.setItem(`session_${interview.id}`, JSON.stringify(currentSession));
      }

      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      await startCamera();
      await startProctoring(currentSession.id);

      setInTestRoom(true);
      setIsFullscreen(true);
      startTimer();
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Failed to initialize proctored session: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Countdown Timer
  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 600) setTimerWarning('10 minutes remaining!');
        if (prev === 300) setTimerWarning('5 minutes remaining!');
        if (prev === 60) setTimerWarning('1 minute remaining!');
        return prev - 1;
      });
    }, 1000);
  };

  // Auto-Save interval (every 20 seconds)
  useEffect(() => {
    if (!inTestRoom || suspended) return;
    const autoSaveInterval = setInterval(() => {
      saveProgress();
    }, 20000);
    return () => clearInterval(autoSaveInterval);
  }, [inTestRoom, answers, suspended]);

  const saveProgress = async (overrideAns) => {
    const currentAns = overrideAns !== undefined ? overrideAns : answers[currentIdx];
    const updatedAnswers = { ...answers, [currentIdx]: currentAns };
    localStorage.setItem(`interview_${code}_answers`, JSON.stringify(updatedAnswers));
    setAutoSavedTime(new Date().toLocaleTimeString());

    if (session && currentQ && currentQ.id && currentAns !== undefined && currentAns !== null) {
      try {
        const payload = {
          sessionId: session.id,
          interviewId: interview.id,
          questionId: currentQ.id,
          candidateId: user.id,
          responseText: ['SUBJECTIVE', 'ESSAY'].includes(currentQ.type) ? currentAns : null,
          selectedOptions: currentQ.type === 'MCQ' ? currentAns : null,
          submittedCode: ['CODING', 'SQL', 'DEBUGGING'].includes(currentQ.type) ? currentAns : null,
          programmingLanguage: currentQ.type === 'CODING' ? (currentQ.language || 'python') : null
        };
        await api.post('/evaluations/responses', payload);
      } catch (err) {
        console.error("Failed to sync answer to database:", err);
      }
    }
  };

  // Browser Security Listeners (Fullscreen, Tab Switch, Window Blur, Shortcuts, Copy/Paste)
  useEffect(() => {
    if (!inTestRoom || suspended) return;

    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        triggerViolation('FULLSCREEN_EXIT', 'Candidate exited fullscreen proctored mode.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('TAB_SWITCH', 'Candidate switched browser tab or minimized window.');
      }
    };

    const handleBlur = () => {
      // TAB_SWITCH handles tab minimization. Only trigger WINDOW_BLUR if document remains visible
      if (!document.hidden) {
        triggerViolation('WINDOW_BLUR', 'Window lost active focus.');
      }
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => {
      e.preventDefault();
      triggerViolation('COPY_ATTEMPT', 'Unauthorized copy action blocked.');
    };
    const handlePaste = (e) => {
      e.preventDefault();
      triggerViolation('PASTE_ATTEMPT', 'Unauthorized paste action blocked.');
    };

    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.altKey && e.key === 'Tab')) {
        e.preventDefault();
        triggerViolation('SHORTCUT_BLOCKED', `Blocked unauthorized shortcut key: ${e.key}`);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inTestRoom, session, suspended]);

  // Network Offline Listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Final Assessment Submission
  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      if (session) {
        // 1. Sync all candidate answers to database before calculation
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const ans = answers[i];
          if (q && q.id && ans !== undefined && ans !== null && ans !== '') {
            try {
              await api.post('/evaluations/responses', {
                sessionId: session.id,
                interviewId: interview.id,
                questionId: q.id,
                candidateId: user.id,
                responseText: ['SUBJECTIVE', 'ESSAY'].includes(q.type) ? ans : null,
                selectedOptions: q.type === 'MCQ' ? ans : null,
                submittedCode: ['CODING', 'SQL', 'DEBUGGING'].includes(q.type) ? ans : null,
                programmingLanguage: q.type === 'CODING' ? (q.language || 'python') : null
              });
            } catch (e) {
              console.warn("Error syncing response for question " + q.id, e);
            }
          }
        }

        // 2. Calculate auto-grade evaluation score in database!
        try {
          await api.post(`/evaluations/calculate/session/${session.id}?candidateId=${user.id}`);
        } catch (e) {
          console.error("Evaluation calculation failed:", e);
        }

        // 3. Submit session & auto-compile report
        await api.post(`/sessions/${session.id}/submit`);
      }
      stopProctoring();
      stopCamera();

      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      alert("Assessment submitted successfully! Redirecting to report summary...");
      navigate(`/reports/${session?.id || interview.id}`);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit session: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("Time has expired! Submitting your assessment automatically.");
    handleFinalSubmit();
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx] || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <RefreshCw className="h-10 w-10 animate-spin text-brand-500 mx-auto" />
          <p className="text-sm font-semibold">Initializing Proctored Test Environment...</p>
        </div>
      </div>
    );
  }

  // STEP 1: PRE-INTERVIEW SYSTEM DIAGNOSTICS CHECK
  if (!inTestRoom) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
        <div className="max-w-3xl mx-auto w-full glass border border-slate-800 p-8 rounded-3xl space-y-6 my-auto shadow-2xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-brand-500" />
            <div>
              <h1 className="font-display font-bold text-2xl text-white">Pre-Assessment System Verification</h1>
              <p className="text-xs text-slate-400">Complete hardware & environment checks before entering the proctored test room.</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-b border-slate-800 py-6 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-slate-400" />
                <div>
                  <span className="font-bold text-white block">Webcam Permission & Availability</span>
                  <span className="text-[11px] text-slate-400">Requires functional camera feed for AI vision tracking</span>
                </div>
              </div>
              {checklist.webcam ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-amber-500" />}
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <Mic className="h-5 w-5 text-slate-400" />
                <div>
                  <span className="font-bold text-white block">Microphone Audio Feed</span>
                  <span className="text-[11px] text-slate-400">Monitors decibel levels for acoustic integrity</span>
                </div>
              </div>
              {checklist.mic ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-amber-500" />}
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-slate-400" />
                <div>
                  <span className="font-bold text-white block">Screen Resolution & Fullscreen Support</span>
                  <span className="text-[11px] text-slate-400">Minimum 1024x768 display resolution required</span>
                </div>
              </div>
              {checklist.resolution ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-amber-500" />}
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-slate-400" />
                <div>
                  <span className="font-bold text-white block">Network Latency & Bandwidth</span>
                  <span className="text-[11px] text-slate-400">Ensures real-time telemetry streaming stability</span>
                </div>
              </div>
              {checklist.network ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-amber-500" />}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <button
              onClick={runSystemCheck}
              disabled={systemChecking}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              {systemChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-brand-500" />}
              <span>{systemChecking ? 'Testing Media Hardware...' : 'Run Diagnostics Check'}</span>
            </button>

            <button
              onClick={handleEnterTestRoom}
              disabled={!checklist.webcam || !checklist.mic}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl text-xs transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Enter Proctored Assessment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: SUSPENDED / TERMINATED LOCKDOWN SCREEN
  if (suspended) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-rose-500 to-red-600 absolute top-0 left-0 right-0" />
          <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
            <ShieldAlert className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-white">Assessment Suspended & Disqualified</h1>
            <p className="text-xs text-rose-400 font-semibold">
              Multiple critical proctoring violations detected ({warningCount} strikes recorded).
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 max-h-48 overflow-y-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Violation Log History:</span>
            {violations.map((v, i) => (
              <div key={i} className="text-xs flex items-center justify-between text-slate-300 border-b border-slate-900 py-1 font-mono">
                <span>⚠️ {v.type}: {v.details}</span>
                <span className="text-slate-500 text-[10px]">{v.time}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400">
            Your assessment session has been terminated and logged in the recruiter dashboard. You can no longer access test questions.
          </p>

          <button
            onClick={() => navigate('/candidate')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 rounded-xl transition-all"
          >
            Return to Candidate Dashboard
          </button>
        </div>
      </div>
    );
  }
  // STEP 2.5: FORCE FULLSCREEN OVERLAY
  if (inTestRoom && !isFullscreen && !suspended) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 z-50">
        <div className="max-w-md w-full bg-slate-900 border border-brand-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-brand-500 to-indigo-650 absolute top-0 left-0 right-0" />
          <div className="h-16 w-16 bg-brand-500/10 text-brand-400 rounded-full flex items-center justify-center mx-auto border border-slate-800">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-display font-bold text-white">Fullscreen Lock Required</h1>
            <p className="text-xs text-slate-400">
              This assessment must be taken in Fullscreen Mode. Please click the button below to resume.
            </p>
          </div>

          <button
            onClick={() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen()
                  .then(() => setIsFullscreen(true))
                  .catch(err => console.error("Request fullscreen failed:", err));
              } else {
                setIsFullscreen(true);
              }
            }}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-1.5"
          >
            <Maximize className="h-4 w-4" />
            <span>Re-enable Fullscreen Mode</span>
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: LIVE PROCTORED TEST ROOM INTERFACE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      
      {/* REAL-TIME PROCTORING VIOLATION WARNING OVERLAY */}
      <WarningOverlay
        show={showWarning}
        violationType={warningType}
        message={warningMsg}
        warningCount={warningCount}
        maxWarnings={3}
        onDismiss={() => {
          if (warningCount < 3) {
            setShowWarning(false);
          }
        }}
      />

      {/* Top Navigation & Status Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-base text-brand-500 font-display">
            <ShieldCheck className="h-5 w-5" />
            <span>ProctorPro <span className="text-white text-xs font-normal">Assessment Room</span></span>
          </div>

          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">{interview?.title}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Candidate: {user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        {/* Live Status Indicators & Timer */}
        <div className="flex items-center gap-4">
          {/* Strikes Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>Strikes: {warningCount} / 3</span>
          </div>

          {/* AI Anomalies Counter Button */}
          <button
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700"
          >
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>AI Alerts ({aiEvents.length})</span>
          </button>

          {/* Health Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} title="AI Telemetry Connection" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Camera Feed" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Audio Stream" />
          </div>

          {/* Countdown Clock */}
          <div className={`px-4 py-1.5 rounded-xl font-mono font-bold text-sm flex items-center gap-2 border ${
            timeLeft < 300 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' : 'bg-slate-800 text-brand-400 border-slate-700'
          }`}>
            <Clock className="h-4 w-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Timer Warning Banner */}
      {timerWarning && (
        <div className="bg-amber-500 text-slate-950 font-bold text-xs py-1.5 text-center flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{timerWarning}</span>
        </div>
      )}

      {/* Offline Warning Banner */}
      {isOffline && (
        <div className="bg-rose-600 text-white font-bold text-xs py-2 text-center flex items-center justify-center gap-2 animate-bounce">
          <Wifi className="h-4 w-4" />
          <span>Internet Disconnected. Assessment paused locally — answers will sync automatically when reconnected.</span>
        </div>
      )}

      {/* AI Telemetry Disconnected Warning Banner */}
      {inTestRoom && !wsConnected && !suspended && (
        <div className="bg-rose-950 border-b border-rose-500/40 text-rose-200 font-bold text-xs py-2 text-center flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          <span>⚠️ AI Proctoring Connection Lost! Video stream telemetry is offline. Please check AI service status.</span>
          <button
            onClick={() => session && startProctoring(session.id)}
            className="ml-2 px-2.5 py-0.5 rounded bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-semibold"
          >
            Reconnect AI
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 overflow-hidden">
        
        {/* Left Side: Question Pane */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          
          {/* Question Header & Palette */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-brand-500">Question {currentIdx + 1} of {questions.length}</span>
                <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
                  {currentQ.type || 'MCQ'}
                </span>
              </div>

              <button
                onClick={() => setMarkedForReview(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  markedForReview[currentIdx] ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {markedForReview[currentIdx] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Text */}
            <h2 className="font-display font-semibold text-base text-white mb-6 leading-relaxed">
              {currentQ.text}
            </h2>

            {/* Question Renderers */}
            {/* Question Renderers */}
            {currentQ.type === 'MCQ' && (
              <div className="space-y-4 max-w-xl">
                {currentQ.codeSnippet && (
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-850 font-mono text-[11px] text-brand-300 overflow-x-auto">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                )}

                <div className="space-y-3">
                  {(typeof currentQ.options === 'string' ? currentQ.options.split(',') : (Array.isArray(currentQ.options) ? currentQ.options : [])).map((opt, i) => {
                    const isMultiple = currentQ.mcqType === 'MULTIPLE';
                    const isSelected = isMultiple
                      ? (answers[currentIdx] || '').split(',').includes(opt)
                      : answers[currentIdx] === opt;

                    return (
                      <label
                        key={i}
                        className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand-500/10 border-brand-500 text-white font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type={isMultiple ? "checkbox" : "radio"}
                          name={`q_${currentIdx}`}
                          value={opt}
                          checked={isSelected}
                          onChange={() => {
                            if (isMultiple) {
                              const currentSel = (answers[currentIdx] || '').split(',').filter(Boolean);
                              const nextSel = currentSel.includes(opt) ? currentSel.filter(o => o !== opt) : [...currentSel, opt];
                              setAnswers({ ...answers, [currentIdx]: nextSel.join(',') });
                            } else {
                              setAnswers({ ...answers, [currentIdx]: opt });
                            }
                          }}
                          className="accent-brand-500 h-4 w-4"
                        />
                        <span className="text-xs">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {currentQ.type === 'CODING' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-350">Starter Template & Constraints: {currentQ.constraints || 'None'}</span>
                  <div className="flex items-center gap-2">
                    <span>Language:</span>
                    <select className="bg-slate-950 border border-slate-800 text-[11px] text-white px-2 py-1 rounded-lg">
                      <option value="python">Python 3</option>
                      <option value="java">Java 21</option>
                      <option value="cpp">C++ 17</option>
                      <option value="javascript">Node.js (JS)</option>
                    </select>
                  </div>
                </div>

                <div className="h-96 border border-slate-800 rounded-2xl overflow-hidden">
                  <CodeEditor
                    value={answers[currentIdx] !== undefined ? answers[currentIdx] : (currentQ.starterCode || '')}
                    onChange={(val) => setAnswers({ ...answers, [currentIdx]: val })}
                    onSave={saveProgress}
                  />
                </div>
              </div>
            )}

            {currentQ.type === 'SQL' && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[11px] text-emerald-400 overflow-x-auto space-y-1">
                  <span className="font-bold text-white block mb-2">📋 DB Schema Definition:</span>
                  <pre><code>{currentQ.starterCode || '-- Table structure schema DDL details'}</code></pre>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Write SQL Query:</span>
                  <textarea
                    rows="6"
                    value={answers[currentIdx] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentIdx]: e.target.value })}
                    placeholder="SELECT * FROM table JOIN..."
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {currentQ.type === 'DEBUGGING' && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[11px] text-rose-400 overflow-x-auto space-y-1">
                  <span className="font-bold text-white block mb-2">❌ Faulty Code (Buggy script):</span>
                  <pre><code>{currentQ.starterCode || '# Defective script template'}</code></pre>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Write Fixed Patch Code:</span>
                  <textarea
                    rows="6"
                    value={answers[currentIdx] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentIdx]: e.target.value })}
                    placeholder="Enter fixed clean code here..."
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {(currentQ.type === 'SUBJECTIVE' || currentQ.type === 'ESSAY') && (
              <div className="space-y-2">
                <textarea
                  rows="8"
                  value={answers[currentIdx] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentIdx]: e.target.value })}
                  placeholder="Type your subjective response here..."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className="font-bold">Words: {(answers[currentIdx] || '').trim().split(/\s+/).filter(Boolean).length} {currentQ.minWords > 0 && `(Min constraint: ${currentQ.minWords})`}</span>
                  {autoSavedTime && <span>Auto-saved at {autoSavedTime}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls & Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Question Palette Shortcuts */}
            <div className="hidden md:flex gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                    currentIdx === idx ? 'ring-2 ring-brand-500 bg-brand-500 text-white' :
                    answers[idx] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    markedForReview[idx] ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Next Question</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Right Side: Proctored Webcam Stream & AI Telemetry */}
        <div className="space-y-6">
          
          {/* Webcam Box */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Video className="h-4 w-4 text-brand-500" />
                <span>AI Camera Monitor</span>
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
                PROCTOR AI ACTIVE
              </div>
            </div>
          </div>

          {/* Live AI Anomaly Telemetry Widget */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Live AI Violations Feed</span>
              </span>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md">
                {aiEvents.length} Alerts
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto text-[11px] font-mono pr-1">
              {aiEvents.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <CheckCircle className="h-6 w-6 mx-auto mb-1 text-emerald-500/50" />
                  <span>No AI violations detected.</span>
                </div>
              ) : (
                aiEvents.map(evt => (
                  <div key={evt.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-amber-400 block">{evt.type}</span>
                      <span className="text-slate-400 text-[10px]">{evt.desc}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{evt.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

      {/* FINAL SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>Confirm Assessment Submission</span>
            </h3>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Answered:</span>
                <span className="font-bold text-emerald-400">{Object.keys(answers).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flagged AI Violations:</span>
                <span className="font-bold text-amber-400">{aiEvents.length}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Are you sure you want to finalize and submit your assessment? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl"
              >
                Continue Assessment
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>{submitting ? 'Submitting...' : 'Confirm Submission'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InterviewRoom;
