import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import notificationService from '../services/notificationService';
import { Sun, Moon, LogOut, ShieldCheck, User, Bell, Settings, HelpCircle, Menu, X, ChevronDown, Key, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Poll for unread notifications from DB
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const response = await notificationService.getUnreadNotifications();
        setUnreadCount(response.data.length);
      } catch (err) {
        console.error("Failed to fetch unread notification count:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user || !user.roles) return '/';
    if (user.roles.includes('ROLE_ADMIN')) return '/admin';
    if (user.roles.includes('ROLE_INTERVIEWER')) return '/interviewer';
    return '/candidate';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Documentation', path: '/docs' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Help Center', path: '/help' },
  ];

  return (
    <nav className="glass border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl tracking-tight text-brand-500">
          <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
          <span>Proctor<span className="text-slate-900 dark:text-white">Pro</span></span>
        </Link>

        {/* Desktop Main Links */}
        <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-slate-200 dark:border-dark-400">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs font-semibold tracking-wide transition-all ${
                location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                  ? 'text-brand-500 font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-500 dark:hover:bg-dark-400 text-slate-700 dark:text-slate-300 transition-colors"
          title="Toggle light/dark theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            {/* Notifications Icon Button */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-500 dark:hover:bg-dark-400 text-slate-700 dark:text-slate-300 transition-colors"
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-dark-900">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Settings Icon Button */}
            <Link
              to="/settings"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-500 dark:hover:bg-dark-400 text-slate-700 dark:text-slate-300 transition-colors hidden sm:inline-block"
              title="Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>

            {/* Profile Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-500 dark:hover:bg-dark-400 border border-slate-200/50 dark:border-dark-400/50 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-xs">
                  {user.firstName[0].toUpperCase()}
                </div>
                <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-600 border dark:border-dark-400 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b dark:border-dark-400 mb-1">
                    <p className="text-xs text-slate-400 font-semibold">Logged in as</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-500/50 font-medium"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-500/50 font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-500/50 font-medium"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    to="/forgot-password"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-500/50 font-medium"
                  >
                    <Key className="h-4 w-4 text-slate-400" />
                    <span>Change Password</span>
                  </Link>

                  <Link
                    to="/help"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-500/50 font-medium"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>Help</span>
                  </Link>

                  <hr className="my-1.5 dark:border-dark-400" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/5 font-semibold text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Create Account
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-500 dark:hover:bg-dark-400 text-slate-700 dark:text-slate-300 lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-[73px] left-0 right-0 bg-white dark:bg-dark-600 border-b dark:border-dark-400 p-6 flex flex-col gap-4 lg:hidden shadow-xl z-40 animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-3.5 text-left">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-all ${
                  location.pathname === link.path
                    ? 'text-brand-500'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {!user && (
            <div className="flex flex-col gap-2.5 pt-4 border-t dark:border-dark-400">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border dark:border-dark-400 text-slate-700 dark:text-slate-200 text-sm font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

