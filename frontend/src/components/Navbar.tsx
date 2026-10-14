import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, Sun, Moon, Menu, X, Shield, LayoutDashboard, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Logo & College Title */}
            <Link to="/" className="flex items-center gap-3 group select-none">
              <img
                src="/logo.jpg"
                alt="City College Logo"
                className="h-10 w-10 rounded-xl shadow-sm object-cover border border-orange-200/60 dark:border-orange-500/30 group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  City College
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary-orange to-amber-500 bg-clip-text text-transparent">
                  Examination Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl transition-all duration-150 flex items-center gap-2 ${
                  isActive('/')
                    ? 'text-primary-orange bg-orange-50 dark:bg-orange-950/40 font-bold'
                    : 'hover:text-primary-orange hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                to="/results"
                className={`px-3 py-2 rounded-xl transition-all duration-150 flex items-center gap-2 ${
                  isActive('/results')
                    ? 'text-primary-orange bg-orange-50 dark:bg-orange-950/40 font-bold'
                    : 'hover:text-primary-orange hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Award size={16} />
                Results
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin/proctoring"
                  className={`px-3 py-2 rounded-xl transition-all duration-150 flex items-center gap-2 ${
                    isActive('/admin/proctoring')
                      ? 'text-primary-orange bg-orange-50 dark:bg-orange-950/40 font-bold'
                      : 'hover:text-primary-orange hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Shield size={16} />
                  Live Proctoring
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-orange dark:hover:text-primary-orange hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
              </button>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

              {/* User Pill */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-orange flex items-center gap-1">
                    {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />} {user.role}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full border-2 border-primary-orange overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {user.profileImage ? (
                    <img
                      src={`${API_BASE_URL}${user.profileImage}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-primary-orange font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={19} />
                </button>
              </div>
            </div>

            {/* Mobile Actions: Theme Toggle + Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer / Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar drawer */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 z-10 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.jpg"
                    alt="City College Logo"
                    className="h-10 w-10 rounded-xl shadow-sm object-cover border border-orange-200/60 dark:border-orange-500/30"
                  />
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white leading-tight">City College</h3>
                    <p className="text-[10px] font-bold text-primary-orange uppercase tracking-wider">Exam Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Info Card in Sidebar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary-orange overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                  {user.profileImage ? (
                    <img
                      src={`${API_BASE_URL}${user.profileImage}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-100 flex items-center justify-center text-primary-orange font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <span className="text-[10px] font-extrabold uppercase text-primary-orange">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 font-semibold text-sm">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive('/')
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-primary-orange font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/results"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive('/results')
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-primary-orange font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Award size={18} />
                  Results
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/proctoring"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive('/admin/proctoring')
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-primary-orange font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Shield size={18} />
                    Live Proctoring
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
