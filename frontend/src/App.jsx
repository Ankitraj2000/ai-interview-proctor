import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CandidateDashboard from './pages/CandidateDashboard';
import InterviewerDashboard from './pages/InterviewerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InterviewRoom from './pages/InterviewRoom';
import ReportDetail from './pages/ReportDetail';

// New Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Documentation from './pages/Documentation';
import Faq from './pages/Faq';
import HelpCenter from './pages/HelpCenter';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotificationsPage from './pages/NotificationsPage';
import FeatureDetail from './pages/FeatureDetail';

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Candidate protected routes */}
            <Route
              path="/candidate"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:code"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
                  <InterviewRoom />
                </ProtectedRoute>
              }
            />

            {/* Interviewer protected routes */}
            <Route
              path="/interviewer"
              element={
                <ProtectedRoute allowedRoles={['ROLE_INTERVIEWER']}>
                  <InterviewerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin protected routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Unified report view (Interviewer / Candidate / Admin) */}
            <Route
              path="/reports/:sessionId"
              element={
                <ProtectedRoute allowedRoles={['ROLE_INTERVIEWER', 'ROLE_CANDIDATE', 'ROLE_ADMIN']}>
                  <ReportDetail />
                </ProtectedRoute>
              }
            />

            {/* Public info routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/features" element={<FeatureDetail />} />
            <Route path="/features/:featureId" element={<FeatureDetail />} />

            {/* Authenticated user utilities */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CANDIDATE', 'ROLE_INTERVIEWER', 'ROLE_ADMIN']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CANDIDATE', 'ROLE_INTERVIEWER', 'ROLE_ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CANDIDATE', 'ROLE_INTERVIEWER', 'ROLE_ADMIN']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CANDIDATE', 'ROLE_INTERVIEWER', 'ROLE_ADMIN']}>
                  <HelpCenter />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
