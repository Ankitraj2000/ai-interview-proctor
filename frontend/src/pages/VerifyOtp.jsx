import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setErrorMsg('Please fill in both email and verification code.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const result = await verifyOtp(email, otp);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account activated successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address to resend OTP.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setResending(true);

    try {
      const response = await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
      setSuccessMsg(response.data.message || 'A new OTP verification code has been sent!');
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setErrorMsg(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 bg-radial-glow transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md glass border rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform duration-200">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
              Verify Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Enter the OTP verification code sent to your email address
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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                Verification Code (OTP)
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/55 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-brand-500/10 active:scale-[0.99] transition-all text-sm mt-3"
            >
              {submitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
            <div>
              Didn't receive a code?{' '}
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={resending}
                className="font-semibold text-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            </div>
            <div>
              <Link to="/login" className="font-semibold text-slate-400 hover:text-slate-300 transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
