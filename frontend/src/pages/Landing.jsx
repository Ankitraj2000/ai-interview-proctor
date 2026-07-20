import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Eye, AlertCircle, Cpu, Volume2, BarChart2, CheckCircle, ChevronRight, Github, Linkedin, HelpCircle, BookOpen, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

const featuresList = [
  {
    id: 'face-detection',
    title: 'Face Detection',
    icon: <Eye className="h-6 w-6 text-brand-500" />,
    description: 'Active face presence validation and multiple face prevention logs.',
    color: 'from-blue-500/10 to-indigo-500/10'
  },
  {
    id: 'eye-tracking',
    title: 'Eye Tracking',
    icon: <Shield className="h-6 w-6 text-brand-500" />,
    description: 'Real-time pupil position & gaze deviation mapping algorithms.',
    color: 'from-emerald-500/10 to-teal-500/10'
  },
  {
    id: 'browser-security',
    title: 'Browser Security',
    icon: <CheckCircle className="h-6 w-6 text-brand-500" />,
    description: 'Enforces fullscreen locking, tab monitoring, and clipboard blocks.',
    color: 'from-amber-500/10 to-orange-500/10'
  },
  {
    id: 'ai-monitoring',
    title: 'AI Monitoring',
    icon: <Cpu className="h-6 w-6 text-brand-500" />,
    description: 'YOLO-driven identification of secondary screens, phones, or books.',
    color: 'from-purple-500/10 to-pink-500/10'
  },
  {
    id: 'audio-monitoring',
    title: 'Audio Monitoring',
    icon: <Volume2 className="h-6 w-6 text-brand-500" />,
    description: 'Vocal activity decibel levels & secondary voice assistance detection.',
    color: 'from-rose-500/10 to-red-500/10'
  },
  {
    id: 'violation-detection',
    title: 'Violation Detection',
    icon: <AlertCircle className="h-6 w-6 text-brand-500" />,
    description: 'Automated warnings tracker, session lockout, and cheating safeguard.',
    color: 'from-cyan-500/10 to-blue-500/10'
  },
  {
    id: 'ai-reports',
    title: 'AI Reports',
    icon: <BarChart2 className="h-6 w-6 text-brand-500" />,
    description: 'Trust scores evaluation, detailed logs, and full visual video timeline.',
    color: 'from-violet-500/10 to-purple-500/10'
  }
];

const Landing = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 bg-radial-glow transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-24 text-center space-y-16">
        <div className="space-y-6">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-semibold uppercase tracking-wider mb-2 animate-pulse-subtle">
            <Cpu className="h-4.5 w-4.5" />
            <span>Next-Generation Automated Proctoring Suite</span>
          </div>

          {/* Hero Title */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-slate-900 dark:text-white max-w-4xl mx-auto">
            Maintain Integrity in Online <br />
            <span className="bg-gradient-to-r from-brand-500 to-indigo-400 bg-clip-text text-transparent">
              Assessments with AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            ProctorPro uses deep learning computer vision and acoustic models to secure remote assessments. Establishes true authentication, eye-tracking checks, and multi-person verification.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto pt-4">
            {user ? (
              <Link
                to={
                  user.roles?.includes('ROLE_ADMIN')
                    ? '/admin'
                    : user.roles?.includes('ROLE_INTERVIEWER')
                    ? '/interviewer'
                    : '/candidate'
                }
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-brand-500/20 text-sm flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-brand-500/20 text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto glass border hover:bg-slate-100 dark:hover:bg-dark-500 text-slate-800 dark:text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-6">
          <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400">
            <p className="text-3xl font-extrabold text-brand-500">99.9%</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Accuracy Rating</p>
          </div>
          <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400">
            <p className="text-3xl font-extrabold text-brand-500">10M+</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Assessments Administered</p>
          </div>
          <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400">
            <p className="text-3xl font-extrabold text-brand-500">30ms</p>
            <p className="text-xs text-slate-400 font-medium mt-1">In-Browser Vision Latency</p>
          </div>
          <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400">
            <p className="text-3xl font-extrabold text-brand-500">200+</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Enterprise Clients</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Security Suite Features</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click any capability below to explore deep technical specifications.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feat) => (
              <Link
                key={feat.id}
                to={`/features/${feat.id}`}
                className="group relative bg-white dark:bg-dark-600 border dark:border-dark-400 p-6 rounded-3xl text-left transition-all hover:shadow-md hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-all`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500">
                  <span>Explore Details</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-600 border-t dark:border-dark-400 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Logo Column */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-brand-500">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
              <span>Proctor<span className="text-slate-900 dark:text-white">Pro</span></span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leading the path in reliable, scalable, and automated digital exam proctoring technologies.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/features" className="hover:text-brand-500 transition-colors">Features Suite</Link></li>
              <li><Link to="/docs" className="hover:text-brand-500 transition-colors">Developer Docs</Link></li>
              <li><Link to="/faq" className="hover:text-brand-500 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-500 transition-colors">Contact Support</Link></li>
              <li><Link to="/help" className="hover:text-brand-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Social / Connect */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Connect</h4>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-dark-900 dark:hover:bg-dark-500 text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-all">
                <Github className="h-4.5 w-4.5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-dark-900 dark:hover:bg-dark-500 text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-all">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
            </div>
            <p className="text-[10px] text-slate-400">
              &copy; {new Date().getFullYear()} ProctorPro Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
