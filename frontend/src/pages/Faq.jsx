import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqsList = [
  {
    q: "Is a webcam and microphone required to take an assessment?",
    a: "Yes. ProctorPro is an AI-driven video and audio proctoring system. Candidates must grant browser permissions to access their camera and microphone prior to starting the assessment."
  },
  {
    q: "What causes a proctoring warning during an exam?",
    a: "Warnings are automatically generated when the AI models detect cheating signals such as looking away, face missing, multiple people in front of the camera, a mobile phone in view, tab switching, exiting fullscreen, or background voice assistance."
  },
  {
    q: "How many warnings can a candidate receive before suspension?",
    a: "By default, the platform allows up to 3 warnings. On the third warning, the system automatically submits the assessment and terminates the candidate session."
  },
  {
    q: "Does ProctorPro store my biometric data?",
    a: "No. Video frames are processed in real-time on our secure servers to generate telemetry logs. No biometric faceprints are saved, and all candidate video streams are discarded post-processing."
  },
  {
    q: "What formats are supported for resume uploading?",
    a: "ProctorPro supports PDF (.pdf) and Microsoft Word (.docx) formats. Uploaded resumes are securely parsed for skills and experience verification."
  }
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
            Frequently Asked <span className="text-brand-500">Questions</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Find quick answers to common questions about ProctorPro's features, security, and setup.
          </p>
        </div>

        <div className="space-y-4">
          {faqsList.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-100/50 dark:hover:bg-dark-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-brand-500 flex-shrink-0" />
                  <span>{faq.q}</span>
                </div>
                {openIndex === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6 pt-2 border-t dark:border-dark-400 text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default Faq;
