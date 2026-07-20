import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import notificationService from '../services/notificationService';
import { Bell, Check, Trash2, Calendar, ShieldCheck, Mail, ShieldAlert, Key } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'PASSWORD_CHANGED':
        return <Key className="h-5 w-5 text-amber-500" />;
      case 'RESUME_UPLOADED':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'INTERVIEW_INVITE':
        return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
      case 'INTERVIEW_UPDATE':
        return <ShieldAlert className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white flex items-center gap-2.5">
              <Bell className="h-7 w-7 text-brand-500" />
              <span>Notifications</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Stay up to date with interview activities and security alerts.</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold text-left">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-dark-600 border dark:border-dark-400 rounded-3xl p-12 text-center space-y-3">
            <Bell className="h-12 w-12 text-slate-300 dark:text-slate-500 mx-auto" />
            <h3 className="font-bold text-lg dark:text-white">All caught up!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 p-5 rounded-2xl border transition-all text-left ${
                  n.isRead
                    ? 'bg-white dark:bg-dark-600 border-slate-200 dark:border-dark-400'
                    : 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/30 dark:border-brand-500/40 shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  <div className="mt-1 p-2 rounded-xl bg-slate-100 dark:bg-dark-500 flex items-center justify-center flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${n.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white'}`}>
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-500 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg transition-all"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg transition-all"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default NotificationsPage;
