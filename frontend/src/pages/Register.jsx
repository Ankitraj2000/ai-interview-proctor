import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, KeyRound, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('CANDIDATE');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const result = await register(firstName, lastName, email, password, role);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account registered successfully! Redirecting to OTP verification...');
      setTimeout(() => {
        // Redirect to OTP page, passing the email in state
        navigate('/verify-otp', { state: { email } });
      }, 2000);
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 bg-radial-glow transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg glass border rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform duration-200">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
              Create an Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Sign up to complete your proctored assessment or manage evaluations
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-white/50 dark:bg-dark-900/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-white/50 dark:bg-dark-900/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>

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
                  placeholder="jane.doe@company.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-white/50 dark:bg-dark-900/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-dark-400 bg-white/50 dark:bg-dark-900/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all text-sm text-slate-900 dark:text-white"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CANDIDATE')}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'CANDIDATE'
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                      : 'glass border-slate-200 dark:border-dark-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Candidate (Exam Taker)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('INTERVIEWER')}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'INTERVIEWER'
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                      : 'glass border-slate-200 dark:border-dark-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Interviewer (Evaluator)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/55 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-brand-500/10 active:scale-[0.99] transition-all text-sm mt-4"
            >
              {submitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
