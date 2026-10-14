import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { User, Lock, Sun, Moon } from 'lucide-react';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginId, password);
      toast.success('Successfully logged in! Welcome back.', 'Authentication Successful');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg, 'Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative">
      {/* Theme toggle on login screen */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft text-slate-500 dark:text-slate-400 hover:text-primary-orange dark:hover:text-primary-orange transition-all duration-200"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <Card className="p-8 sm:p-10 border-t-4 border-t-primary-orange relative overflow-hidden">
          {/* Subtle top background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-orange-400/10 blur-2xl pointer-events-none rounded-full" />

          {/* College Logo and Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <img
              src="/logo.jpg"
              alt="City College Logo"
              className="w-16 h-16 rounded-2xl shadow-md object-cover border-2 border-orange-200/80 dark:border-orange-500/30 mb-4 transition-transform hover:scale-105 duration-200"
            />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              City College
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-orange mt-0.5">
              Online Examination Portal
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Sign in to access your examinations and dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Login ID"
              type="text"
              required
              placeholder="Student ID or admin username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              leftIcon={<User size={18} />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-md hover:shadow-lg"
              >
                Sign In to Portal
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              City College Examination System &bull; Secured with JWT &amp; AI Proctoring
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
