import React from 'react';
import { AlertOctagon, ShieldAlert } from 'lucide-react';

const WarningOverlay = ({ show, violationType, message, warningCount, maxWarnings = 3, onDismiss }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-dark-850 border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300">
        
        {/* Color stripe for hazard emphasis */}
        <div className="h-2 bg-gradient-to-r from-rose-500 to-amber-500" />

        <div className="p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-4">
            <AlertOctagon className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <ShieldAlert className="h-5.5 w-5.5 text-rose-500" />
            <span>Violation Detected</span>
          </h3>

          <div className="mt-3 bg-slate-50 dark:bg-dark-900/50 rounded-xl p-3.5 border dark:border-dark-400">
            <span className="block text-xs font-semibold uppercase text-rose-500 tracking-wider">
              {violationType ? violationType.replace(/_/g, ' ') : 'Proctor Alert'}
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {message}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between px-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Strict proctoring protocols are in place.
            </span>
            <span className="bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/20 text-sm font-bold px-3 py-1 rounded-lg">
              Warning {warningCount} of {maxWarnings}
            </span>
          </div>

          {warningCount >= maxWarnings ? (
            <div className="mt-5 bg-rose-600 text-white rounded-xl py-3 text-sm font-bold animate-pulse">
              EXAMINATION HAS BEEN SUSPENDED & DISQUALIFIED
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Please refocus on the exam window immediately. Further violations will result in automatic test cancellation.
              </p>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md"
                >
                  I Acknowledge & Resume Assessment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarningOverlay;
