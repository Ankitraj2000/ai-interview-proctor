import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Sun, Moon, Bell, Globe, UserCheck, ShieldAlert, CheckCircle } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState({
    emailInvites: true,
    cheatingAlerts: true,
    reminders: false,
    systemUpdates: true
  });

  const [language, setLanguage] = useState('en');
  const [success, setSuccess] = useState(false);

  const saveSettings = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="text-left">
          <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <SettingsIcon className="h-7 w-7 text-brand-500" />
            <span>Settings</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your application preferences, notifications, and language settings.</p>
        </div>

        {success && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={saveSettings} className="space-y-6 text-left">
          {/* Theme Section */}
          <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Moon className="h-5 w-5 text-brand-500" />
              <span>Theme Preferences</span>
            </h2>
            <div className="flex items-center justify-between border dark:border-dark-400 p-4 rounded-2xl">
              <div>
                <p className="text-sm font-semibold dark:text-white">Interface Mode</p>
                <p className="text-xs text-slate-400">Toggle between Light and Dark interface appearance</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-4 py-2 bg-slate-100 dark:bg-dark-500 border dark:border-dark-400 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-dark-400"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          {/* Notifications Toggles */}
          <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-500" />
              <span>Notification Settings</span>
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border dark:border-dark-400 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-500/20">
                <div>
                  <p className="text-xs font-semibold dark:text-white">Email Interview Invites</p>
                  <p className="text-[10px] text-slate-400">Receive an email whenever an interview is scheduled for you</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailInvites}
                  onChange={(e) => setNotifications({ ...notifications, emailInvites: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border dark:border-dark-400 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-500/20">
                <div>
                  <p className="text-xs font-semibold dark:text-white">AI Integrity Violation Alerts</p>
                  <p className="text-[10px] text-slate-400">Receive alerts if real-time cheating violations exceed the safety count</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.cheatingAlerts}
                  onChange={(e) => setNotifications({ ...notifications, cheatingAlerts: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border dark:border-dark-400 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-500/20">
                <div>
                  <p className="text-xs font-semibold dark:text-white">Interview Reminders</p>
                  <p className="text-[10px] text-slate-400">Receive reminders 24 hours and 1 hour before scheduled start time</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.reminders}
                  onChange={(e) => setNotifications({ ...notifications, reminders: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
              </label>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-500" />
              <span>Language & Locale</span>
            </h2>
            <div className="flex items-center justify-between p-4 border dark:border-dark-400 rounded-2xl">
              <div>
                <p className="text-sm font-semibold dark:text-white">Display Language</p>
                <p className="text-xs text-slate-400">Set the interface translation language</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-dark-900 border dark:border-dark-400 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-brand-500" />
              <span>Account Status Details</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border dark:border-dark-400 rounded-xl">
                <p className="text-slate-400 mb-0.5">Role Permission</p>
                <p className="font-bold dark:text-white">{user?.roles?.join(', ') || 'N/A'}</p>
              </div>
              <div className="p-3 border dark:border-dark-400 rounded-xl">
                <p className="text-slate-400 mb-0.5">Account Status</p>
                <p className="font-bold text-emerald-500">Active / Verified</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl text-sm transition-all"
          >
            Save Settings Preferences
          </button>
        </form>
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default Settings;
