import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { HelpCircle, AlertCircle, LifeBuoy, Headphones, CheckCircle } from 'lucide-react';

const troubleshootingSteps = [
  {
    title: "Camera Access Blocked",
    description: "Ensure that other applications (like Zoom, Teams, or Skype) are closed. Click the lock icon in the browser address bar next to the URL and toggle 'Camera' permission to 'Allow'. Refresh the page."
  },
  {
    title: "Browser Exiting Fullscreen",
    description: "ProctorPro requires fullscreen mode to prevent distraction or secondary aids. If you accidentally exit fullscreen, click the fullscreen prompt in the center of the screen to re-engage instantly."
  },
  {
    title: "WebSocket Disconnected Status",
    description: "If the AI Live Connection dot turns red, check your internet connectivity. The platform automatically attempts reconnection. If the issue persists, refresh the page to restart the session."
  }
];

const HelpCenter = () => {
  const [supportMessage, setSupportMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSupportMessage('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
            Help <span className="text-brand-500">Center</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Troubleshoot system setups, submit support tickets, or search documentation guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Troubleshooting Guides */}
          <div className="space-y-6 text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5.5 w-5.5 text-brand-500" />
              <span>Common Troubleshooting Steps</span>
            </h2>
            <div className="space-y-4">
              {troubleshootingSteps.map((step, idx) => (
                <div key={idx} className="bg-white dark:bg-dark-600 border dark:border-dark-400 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Support Ticket Submission */}
          <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 p-8 rounded-3xl space-y-6 text-left shadow-sm h-fit">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Headphones className="h-5.5 w-5.5 text-brand-500" />
              <span>Submit a Help Ticket</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit your inquiry or report a technical issue. Our system administrators will review your issue immediately.
            </p>

            {submitted ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Ticket submitted successfully! We will get in touch shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">How can we help you? *</label>
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe the issue you're experiencing in detail..."
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-xs transition-all"
                >
                  Submit Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default HelpCenter;
