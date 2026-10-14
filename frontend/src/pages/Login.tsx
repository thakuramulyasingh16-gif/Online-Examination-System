import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  User,
  Lock,
  Sun,
  Moon,
  Eye,
  EyeOff,
  GraduationCap,
  Shield,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  HelpCircle,
  Loader2,
  Server,
} from 'lucide-react';

const Login: React.FC = () => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'ready' | 'waking'>('checking');

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef<any>(null);

  // Restore saved credentials & proactively ping Render health check
  useEffect(() => {
    try {
      const savedId = localStorage.getItem('city_college_login_id');
      const savedRole = localStorage.getItem('city_college_login_role') as 'student' | 'admin' | null;
      if (savedId) {
        setLoginId(savedId);
        setRememberMe(true);
      }
      if (savedRole === 'student' || savedRole === 'admin') {
        setRole(savedRole);
      }
    } catch {
      // ignore storage errors
    }

    // Ping health endpoint to warm up sleeping Render instance
    const pingHealth = async () => {
      const slowTimeout = setTimeout(() => {
        setServerStatus('waking');
      }, 2500);

      try {
        await api.get('/health', { timeout: 60000 });
        clearTimeout(slowTimeout);
        setServerStatus('ready');
      } catch {
        clearTimeout(slowTimeout);
        setServerStatus('waking');
      }
    };

    pingHealth();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRoleChange = (newRole: 'student' | 'admin') => {
    setRole(newRole);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    setServerWaking(false);

    // If request takes longer than 3.5s, backend is likely waking up from Render cold sleep
    timerRef.current = setTimeout(() => {
      setServerWaking(true);
    }, 3500);

    try {
      await login(loginId.trim(), password);

      if (rememberMe) {
        localStorage.setItem('city_college_login_id', loginId.trim());
        localStorage.setItem('city_college_login_role', role);
      } else {
        localStorage.removeItem('city_college_login_id');
        localStorage.removeItem('city_college_login_role');
      }

      toast.success(
        role === 'admin' ? 'Welcome back, Administrator!' : 'Welcome back to City College Portal!',
        'Authentication Successful'
      );
      navigate('/');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      let displayMsg = 'Login failed. Please verify your credentials.';

      if (serverMsg) {
        displayMsg = serverMsg;
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        displayMsg = 'Server response timed out. Render backend is warming up, please retry in a few moments.';
      } else {
        displayMsg = 'Galat Login ID ya password. Kripya check karke dobara koshish karein.';
      }

      setErrorMessage(displayMsg);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error(displayMsg, 'Authentication Failed');
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsLoading(false);
      setServerWaking(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* LEFT PANEL: Modern College Branding & Illustration (Visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-600 via-primary-orange to-amber-600 dark:from-slate-950 dark:via-orange-950/70 dark:to-slate-900 p-12 xl:p-16 flex-col justify-between select-none">
        {/* Decorative background glow & pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-4">
          <img
            src="/logo.jpg"
            alt="City College Logo"
            className="w-14 h-14 rounded-2xl shadow-xl object-cover border-2 border-white/50 backdrop-blur-md"
          />
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              City College
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-100/90">
              Online Examination Portal
            </p>
          </div>
        </div>

        {/* Center Hero Tagline & Features */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white border border-white/20 mb-6">
            <Sparkles size={14} className="text-yellow-300" />
            Empowering Academic Integrity
          </div>

          <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Learn.<br />
            <span className="text-yellow-200 dark:text-orange-300">Test.</span><br />
            Grow.
          </h1>

          <p className="text-base text-orange-50/90 dark:text-slate-300 font-medium leading-relaxed mb-8">
            A state-of-the-art examination platform engineered with intelligent proctoring,
            seamless live feeds, and real-time verifiable grading.
          </p>

          {/* Value props cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/15 dark:border-slate-800 text-white">
              <div className="p-2 rounded-xl bg-white/20 text-white">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">AI Surveillance & Proctoring</p>
                <p className="text-xs text-orange-100/80 dark:text-slate-400">Continuous webcam feed monitoring with anti-misconduct algorithms</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/15 dark:border-slate-800 text-white">
              <div className="p-2 rounded-xl bg-white/20 text-white">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Instant Assessment & Analytics</p>
                <p className="text-xs text-orange-100/80 dark:text-slate-400">Automated grading and performance breakdown reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-orange-100/70 dark:text-slate-500 font-medium pt-6 border-t border-white/15 dark:border-slate-800">
          <span>&copy; {new Date().getFullYear()} City College Examination System</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-300" />
            ISO 27001 Secure
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Modern & Minimal Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative min-h-screen">
        {/* Top-Right Theme Toggle */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
          {/* Server Status Indicator Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              serverStatus === 'ready'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse'
            }`}
            title="Render Backend Server Connection"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'ready' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
              }`}
            />
            {serverStatus === 'ready' ? 'Server Connected' : 'Server Warming Up...'}
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft text-slate-500 dark:text-slate-400 hover:text-primary-orange dark:hover:text-primary-orange hover:border-orange-200 dark:hover:border-slate-700 transition-all duration-200"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </div>

        <div className="w-full max-w-md animate-fade-in my-8">
          {/* Mobile Header (Hidden on large screens where left panel shows) */}
          <div className="lg:hidden flex flex-col items-center mb-6 text-center select-none">
            <img
              src="/logo.jpg"
              alt="City College Logo"
              className="w-14 h-14 rounded-2xl shadow-md object-cover border-2 border-orange-200/80 dark:border-orange-500/30 mb-3"
            />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              City College
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-orange mt-0.5">
              Online Examination Portal
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
              Learn. Test. Grow.
            </p>
          </div>

          {/* Login Card with Shake Animation on Error */}
          <div
            className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-card p-7 sm:p-9 relative overflow-hidden transition-all duration-200 ${
              isShaking ? 'animate-shake border-rose-300 dark:border-rose-700' : ''
            }`}
          >
            {/* Top Accent Line */}
            <div
              className={`absolute top-0 inset-x-0 h-1.5 transition-colors duration-300 ${
                role === 'student'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                  : 'bg-gradient-to-r from-slate-700 via-orange-600 to-slate-900 dark:from-slate-600 dark:to-orange-500'
              }`}
            />

            {/* Role Switcher Tabs */}
            <div className="mb-6">
              <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                    role === 'student'
                      ? 'bg-white dark:bg-slate-900 text-primary-orange shadow-soft font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap size={16} />
                  Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                    role === 'admin'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-soft font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield size={15} />
                  Admin Console
                </button>
              </div>
            </div>

            {/* Header Content */}
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {role === 'student' ? 'Student Sign In' : 'Administrator Sign In'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {role === 'student'
                  ? 'Enter your student credentials to begin or review your exams.'
                  : 'Enter authorized administrative credentials for exam control & proctoring.'}
              </p>
            </div>

            {/* Inline Error Notice */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 animate-fade-in text-rose-800 dark:text-rose-200">
                <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="text-xs font-semibold leading-snug">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Render Cold Start Notification */}
            {serverWaking && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 animate-pulse text-amber-900 dark:text-amber-200">
                <Server size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 animate-bounce" />
                <div className="text-xs">
                  <p className="font-bold leading-tight">Server jag raha hai, 30-60 sec ruko...</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-snug">
                    Render free tier par inactive backend ko start hone me thoda samay lagta hai. Kripya page band na karein.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login ID Input with Focus Glow */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {role === 'student' ? 'Student Login ID' : 'Admin Username'}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    {role === 'student' ? <User size={18} /> : <Shield size={18} />}
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={role === 'student' ? 'e.g. STU-001 or roll number' : 'e.g. admin'}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-primary-orange focus:ring-4 focus:ring-orange-500/20 focus:shadow-[0_0_18px_rgba(255,140,0,0.22)] focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle & Focus Glow */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-primary-orange focus:ring-4 focus:ring-orange-500/20 focus:shadow-[0_0_18px_rgba(255,140,0,0.22)] focus:bg-white dark:focus:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-primary-orange focus:ring-primary-orange focus:ring-offset-0 cursor-pointer accent-orange-500"
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Remember me on this device
                  </span>
                </label>
              </div>

              {/* Login Button with Lift + Shadow Hover State */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide text-white transition-all duration-200 flex items-center justify-center gap-2 select-none shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md ${
                    role === 'student'
                      ? 'bg-gradient-to-r from-orange-500 via-primary-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/25'
                      : 'bg-gradient-to-r from-slate-900 via-slate-800 to-orange-700 hover:from-black hover:to-orange-800 hover:shadow-slate-900/30 dark:from-slate-800 dark:to-orange-600'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>
                        {serverWaking
                          ? 'Server Jag Raha Hai...'
                          : role === 'student'
                          ? 'Signing in as Student...'
                          : 'Signing in as Admin...'}
                      </span>
                    </>
                  ) : (
                    <span>
                      {role === 'student' ? 'Sign In as Student' : 'Sign In as Administrator'}
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Forgot Password Notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <HelpCircle size={14} className="text-primary-orange shrink-0" />
                <span>Forgot password? </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Admin se contact karein
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Examination Department &bull; City College Helpdesk
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
