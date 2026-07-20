import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
            Contact <span className="text-brand-500">Support</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Got questions? We're here to help. Reach out to our technical, sales, or support team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6 lg:col-span-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Get in Touch</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              For general inquiries, enterprise sales, or technical support, please contact us through any of the channels below.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email us</p>
                  <p className="text-sm font-semibold dark:text-white">support@proctorpro.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Call us</p>
                  <p className="text-sm font-semibold dark:text-white">+1 (800) 555-0199</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Office headquarters</p>
                  <p className="text-sm font-semibold dark:text-white">100 Silicon Valley Blvd, CA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-600 p-8 rounded-3xl border dark:border-dark-400 lg:col-span-2 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
                <h3 className="font-bold text-xl dark:text-white">Message Sent Successfully!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Thank you for reaching out. A support representative will respond to your request within the next 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Message Body</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-dark-400 bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
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

export default Contact;
