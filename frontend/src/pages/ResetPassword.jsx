import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, KeyRound, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const result = await resetPassword(email, otp, newPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Password updated successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 bg-radial-glow transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md glass border rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform duration-200">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Enter your recovery OTP code and your new account password
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs px-3.5 py-3 rounded-xl">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs px-3.5 py-3 rounded-xl">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white/50 dark:bg-dark-900/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Recovery OTP Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white/50 dark:bg-dark-900/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all text-sm text-slate-900 dark:text-white tracking-widest text-center font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-dark-400 bg-white/50 dark:bg-dark-900/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all text-sm text-slate-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/55 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-brand-500/10 active:scale-[0.99] transition-all text-sm mt-3"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
