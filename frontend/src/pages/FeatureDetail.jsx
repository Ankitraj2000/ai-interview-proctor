import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Eye, ShieldAlert, Cpu, Award, Terminal, Volume2, BarChart2, Shield } from 'lucide-react';

const featuresData = {
  'face-detection': {
    title: 'Face Detection',
    icon: <Eye className="h-8 w-8 text-brand-500" />,
    description: 'Verifies the constant presence of the authorized candidate, matches identity against reference pictures, and flags unauthorized users.',
    details: [
      'Active Face Verification: Continually runs face matching with a reference webcam photo to prevent candidate substitution.',
      'Multiple Face Prevention: Detects if more than one face appears in the camera frame, immediately triggering a violation.',
      'Head Pose Estimation: Triggers warnings when the candidate turns their head significantly away from the viewport.'
    ],
    technical: 'Built on a lightweight MobileNet-SSD face landmark estimation model running locally in-browser via WebGL and validated via server-side verification pipelines.'
  },
  'eye-tracking': {
    title: 'Eye Tracking',
    icon: <Shield className="h-8 w-8 text-brand-500" />,
    description: 'Tracks the gaze of the candidate to ensure they are looking at the test viewport and not off-screen for assistance.',
    details: [
      'Iris & Pupil Detection: Tracks ocular movement coordinates in real-time.',
      'Deviation Warnings: Logs a violation when the gaze vector exits the screen boundaries for longer than a predefined threshold (e.g. 5 seconds).',
      'Ambient Light Calibration: Adapts to variable lighting conditions to reduce false positives.'
    ],
    technical: 'Implements facial landmark tracking matrices on the frontend to calculate the pitch, yaw, and roll vectors of the eye focus area.'
  },
  'browser-security': {
    title: 'Browser Security',
    icon: <Terminal className="h-8 w-8 text-brand-500" />,
    description: 'Establishes a locked environment inside the browser to disable copy-paste, print screen, developer tool injection, and multi-tab activities.',
    details: [
      'Fullscreen Lockout: Enforces fullscreen mode. Exiting fullscreen results in an immediate warning or automatic submission.',
      'Tab & Blur Listener: Raises violations when the candidate focus shifts away from the browser window.',
      'Clipboard Protection: Disables copy, cut, paste, and right-click actions on all question elements.'
    ],
    technical: 'Uses native HTML5 Fullscreen APIs coupled with document visibility listeners and keyboard shortcut interceptors (e.g., F12, Ctrl+C).'
  },
  'ai-monitoring': {
    title: 'AI Monitoring',
    icon: <Cpu className="h-8 w-8 text-brand-500" />,
    description: 'Detects prohibited items like smart devices, textbooks, or secondary monitors in the candidates environment.',
    details: [
      'Mobile Phone Detection: Scans video frames for rectangular handheld devices.',
      'Book & Document Detection: Recognizes paper guides, cheat sheets, or reference materials.',
      'Secondary Monitor Flags: Inspects ambient lighting and setup configuration flags.'
    ],
    technical: 'Runs YOLO-based real-time object classification models on video frames to detect and categorize surrounding hardware devices.'
  },
  'audio-monitoring': {
    title: 'Audio Monitoring',
    icon: <Volume2 className="h-8 w-8 text-brand-500" />,
    description: 'Analyzes microphone audio for voice assistance, whispering, or ambient speech during the exam session.',
    details: [
      'Decibel Level Monitoring: Detects volume spikes that exceed the baseline background noise.',
      'Voice Activity Detection (VAD): Distinguishes between ambient noise and human speech.',
      'Speech Telemetry: Automatically flags segments containing vocal activity for manual verification.'
    ],
    technical: 'Utilizes the Web Audio API on the frontend to capture frequency coefficients, transmitting data packets for voice fingerprint analysis.'
  },
  'violation-detection': {
    title: 'Violation Detection',
    icon: <ShieldAlert className="h-8 w-8 text-brand-500" />,
    description: 'Maintains an active integrity tracker, displaying transparent warnings and auto-terminating sessions upon repeated infractions.',
    details: [
      'Warning Counter: Displays real-time warnings to the candidate, giving them a chance to correct behavior.',
      'Auto-Submission Safeguard: Automatically saves and submits the exam when the infraction count exceeds the configured limit (default: 3).',
      'Activity Logs: Stores exact timestamps, violation types, and frame snapshots in the database.'
    ],
    technical: 'Implements state machine logic synchronized between React UI state and Spring Boot Hibernate entity updates.'
  },
  'ai-reports': {
    title: 'AI Reports & Audits',
    icon: <BarChart2 className="h-8 w-8 text-brand-500" />,
    description: 'Provides interviewers and admins with comprehensive post-exam audit trails, trust scores, and visual timelines.',
    details: [
      'Trust Index Score: Computes an overall percentage score indicating the confidence level of exam integrity.',
      'Chronological Timeline: Displays a minute-by-minute timeline of the assessment with flagged warnings.',
      'Snapshot Carousel: Allows administrators to review exact webcam snapshots captured at the moment of violation.'
    ],
    technical: 'Compiles SQL telemetry logs into JSON reports, rendering custom SVG graphs and interactive charts using Tailwind.'
  }
};

const FeatureDetail = () => {
  const { featureId } = useParams();
  const currentId = featureId || 'face-detection';
  const feature = featuresData[currentId] || featuresData['face-detection'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2 text-left">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white px-2 mb-4">Core Features</h2>
          {Object.keys(featuresData).map((key) => (
            <Link
              key={key}
              to={`/features/${key}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentId === key
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-dark-500/20'
              }`}
            >
              <div className="p-1 bg-slate-100 dark:bg-dark-500 rounded-lg text-slate-700 dark:text-slate-300">
                {React.cloneElement(featuresData[key].icon, { className: 'h-4 w-4 text-brand-500' })}
              </div>
              <span>{featuresData[key].title}</span>
            </Link>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-8 shadow-sm text-left space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl">
              {feature.icon}
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">{feature.title}</h1>
              <p className="text-xs text-slate-400 font-medium">ProctorPro Integrity Suite Component</p>
            </div>
          </div>

          <hr className="dark:border-dark-400" />

          <div className="space-y-4">
            <h2 className="text-base font-bold dark:text-white">Feature Overview</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold dark:text-white">Key Capabilities & Features</h2>
            <ul className="space-y-3">
              {feature.details.map((detail, index) => (
                <li key={index} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="text-brand-500 font-bold">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-dark-900 border dark:border-dark-400 p-5 rounded-2xl space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">Technical Implementation</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">{feature.technical}</p>
          </div>
        </div>
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default FeatureDetail;
