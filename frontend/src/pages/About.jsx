import React from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, Users, Target, Cpu } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-white">
            About <span className="text-brand-500">ProctorPro</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Empowering institutions and organizations worldwide with high-integrity remote examinations secured by advanced artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              At ProctorPro, we believe that education and skill evaluation should be accessible to everyone, anywhere, without compromising on credibility and trust. 
              Our state-of-the-art AI-powered platform provides automated, non-intrusive, and highly secure proctoring solutions that replicate the rigor of in-person invigilation.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              By combining computer vision, audio analytics, and strict browser lockouts, we deliver comprehensive, unbiased reports that help recruiters and educators make confident, data-driven decisions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400 text-center space-y-2">
              <ShieldCheck className="h-8 w-8 text-brand-500 mx-auto" />
              <h3 className="font-bold text-lg dark:text-white">Trustworthy</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">99.9% accuracy in cheat detection</p>
            </div>
            <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400 text-center space-y-2">
              <Users className="h-8 w-8 text-brand-500 mx-auto" />
              <h3 className="font-bold text-lg dark:text-white">Global Reach</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supporting users across 120+ countries</p>
            </div>
            <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400 text-center space-y-2">
              <Target className="h-8 w-8 text-brand-500 mx-auto" />
              <h3 className="font-bold text-lg dark:text-white">Precision</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time gaze & audio telemetry</p>
            </div>
            <div className="bg-white dark:bg-dark-600 p-6 rounded-2xl border dark:border-dark-400 text-center space-y-2">
              <Cpu className="h-8 w-8 text-brand-500 mx-auto" />
              <h3 className="font-bold text-lg dark:text-white">AI-Powered</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deep learning model pipeline</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-600 p-8 rounded-3xl border dark:border-dark-400 space-y-4 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ready to experience the future of secure assessments?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Join thousands of administrators, universities, and enterprise companies in establishing fair testing environments.
          </p>
        </div>
      </main>
      <footer className="py-6 border-t dark:border-dark-400 glass text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} ProctorPro Inc. Secured AI Proctored Evaluations. All rights reserved.
      </footer>
    </div>
  );
};

export default About;
