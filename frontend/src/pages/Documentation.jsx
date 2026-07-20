import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Key, ShieldAlert, Cpu, Eye, Monitor, FileText } from 'lucide-react';

const docsContent = {
  gettingStarted: {
    title: "Getting Started",
    icon: <BookOpen className="h-5 w-5 text-brand-500" />,
    body: (
      <div className="space-y-4 text-sm">
        <p className="text-slate-600 dark:text-slate-300">Welcome to the ProctorPro documentation. ProctorPro is an AI-powered proctoring platform designed to ensure academic and professional recruitment assessment integrity.</p>
        <h3 className="font-bold text-slate-800 dark:text-white mt-4">Platform Overview</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>Candidates</strong> can log in, upload resumes, and join scheduled assessments using invitation codes.</li>
          <li><strong>Interviewers</strong> can configure question banks, assign tests, set security requirements, and view assessment reports.</li>
          <li><strong>Admins</strong> have full operational controls over user roles, logs, system parameters, and question banks.</li>
        </ul>
      </div>
    )
  },
  aiVerification: {
    title: "AI & Computer Vision",
    icon: <Eye className="h-5 w-5 text-brand-500" />,
    body: (
      <div className="space-y-4 text-sm">
        <p className="text-slate-600 dark:text-slate-300">ProctorPro utilizes WebRTC-based video frame analysis. The frontend streams camera feed securely to our FastAPI Python microservice running PyTorch-based neural networks.</p>
        <h3 className="font-bold text-slate-800 dark:text-white mt-4">Key AI Capabilities</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>Face Detection:</strong> Identifies if the candidate has walked away or if multiple faces are present in the camera frame.</li>
          <li><strong>Gaze Tracking:</strong> Detects if the candidate is looking away from the monitor continuously.</li>
          <li><strong>Phone Detection:</strong> Flags mobile phones or auxiliary screens in the camera frame.</li>
        </ul>
      </div>
    )
  },
  browserSecurity: {
    title: "Browser Locks & Security",
    icon: <Monitor className="h-5 w-5 text-brand-500" />,
    body: (
      <div className="space-y-4 text-sm">
        <p className="text-slate-600 dark:text-slate-300">ProctorPro applies absolute browser-level restrictions on the candidate's browser during the assessment window.</p>
        <h3 className="font-bold text-slate-800 dark:text-white mt-4">Enforced Regulations</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>Fullscreen Mode:</strong> The exam immediately locks out and flags warning events if the candidate exits fullscreen mode.</li>
          <li><strong>Tab Switch Blocker:</strong> Restricts navigation to external tabs or windows.</li>
          <li><strong>Clipboard Blocker:</strong> Prevents copying question text or pasting outside code.</li>
          <li><strong>DevTools Blocker:</strong> Listens for inspection attempts and alerts immediately.</li>
        </ul>
      </div>
    )
  },
  audioMonitoring: {
    title: "Acoustic Analysis",
    icon: <Cpu className="h-5 w-5 text-brand-500" />,
    body: (
      <div className="space-y-4 text-sm">
        <p className="text-slate-600 dark:text-slate-300">Our real-time acoustic models evaluate sound decibels and capture secondary speech to flag helper-assisted cheating.</p>
        <h3 className="font-bold text-slate-800 dark:text-white mt-4">Metrics Captured</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>Background Noise:</strong> Calibrates environmental threshold levels.</li>
          <li><strong>Voice Detection:</strong> Flags conversational speech patterns.</li>
        </ul>
      </div>
    )
  },
  apiReports: {
    title: "API Integration & Reports",
    icon: <FileText className="h-5 w-5 text-brand-500" />,
    body: (
      <div className="space-y-4 text-sm">
        <p className="text-slate-600 dark:text-slate-300">The backend exposes a full REST API under <code className="bg-slate-100 dark:bg-dark-500 px-1 rounded">/api</code>. All protected routes require a JWT Bearer token obtained from <code className="bg-slate-100 dark:bg-dark-500 px-1 rounded">/api/auth/login</code>.</p>
        <h3 className="font-bold text-slate-800 dark:text-white mt-4">Key Endpoint Groups</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>Auth:</strong> Register, OTP verify, Login, Forgot/Reset Password.</li>
          <li><strong>Interviews:</strong> Schedule, list by role, look up by access code, update status.</li>
          <li><strong>Sessions:</strong> Start session, log browser violations, log AI events, submit.</li>
          <li><strong>Reports:</strong> Generate report, retrieve, download as PDF or Excel.</li>
          <li><strong>Questions:</strong> Full CRUD for question bank, question sets, and coding test cases.</li>
          <li><strong>Notifications:</strong> List, mark read, mark all read, count unread.</li>
        </ul>
        <h3 className="font-bold text-slate-800 dark:text-white mt-4">Swagger UI</h3>
        <p className="text-slate-600 dark:text-slate-300">Interactive API documentation is available at <code className="bg-slate-100 dark:bg-dark-500 px-1 rounded">/api/swagger-ui/index.html</code> when the backend is running.</p>
      </div>
    )
  }
};

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('gettingStarted');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2 text-left">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white px-2 mb-4">Documentation</h2>
          {Object.keys(docsContent).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === key
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-dark-500/20'
              }`}
            >
              {docsContent[key].icon}
              <span>{docsContent[key].title}</span>
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-8 shadow-sm text-left space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            {docsContent[activeTab].icon}
            <span>{docsContent[activeTab].title}</span>
          </h2>
          <hr className="dark:border-dark-400" />
          {docsContent[activeTab].body}
        </div>
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default Documentation;
