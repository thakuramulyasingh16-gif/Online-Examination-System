import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  RefreshCw,
  Plus,
  ShieldCheck,
  Radio,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import type { AdminTab } from './AdminSidebar';
import { API_BASE_URL } from '../../config';

interface AdminTopBarProps {
  currentTab: AdminTab;
  onOpenMobileSidebar: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  liveCount: number;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  collegeName?: string;
}

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'System Overview',
    subtitle: 'Real-time performance analytics, exam metrics & system activities',
  },
  students: {
    title: 'Student Directory',
    subtitle: 'Manage student records, credentials, bulk CSV uploads & account status',
  },
  exams: {
    title: 'Exam Management',
    subtitle: 'Configure examination schedule, duration, marking rules & status',
  },
  questions: {
    title: 'Question Bank & Repository',
    subtitle: 'Add, edit, bulk import questions with difficulty levels & explanations',
  },
  results: {
    title: 'Results & Performance Analytics',
    subtitle: 'Review student scorecards, detailed answer sheets, and export reports',
  },
  proctoring: {
    title: 'Live AI Proctoring Center',
    subtitle: 'Real-time student webcam surveillance, anomalies, warnings & termination',
  },
  settings: {
    title: 'Portal & Security Settings',
    subtitle: 'Manage college identity, passing criteria & administrator password',
  },
};

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onRefresh,
  isRefreshing = false,
  liveCount,
  onQuickAction,
  quickActionLabel,
  collegeName = 'City College',
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const currentMeta = tabTitles[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200 shadow-xs">
      {/* Left: Mobile Menu Button + Title / Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span className="hidden sm:inline">{collegeName}</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-primary-orange font-bold uppercase tracking-wider text-[10px]">
              {currentTab}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Live Indicator, Theme Toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Proctoring Status Pill */}
        {liveCount > 0 ? (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-tight">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider">{liveCount} Live</span>
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            <Radio size={12} className="text-slate-400" />
            <span>0 Active Streams</span>
          </div>
        )}

        {/* Refresh Data Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-orange dark:hover:text-primary-orange hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title="Refresh statistics and data"
        >
          <RefreshCw size={17} className={isRefreshing ? 'animate-spin text-primary-orange' : ''} />
        </button>

        {/* Optional Quick Action Button (e.g. + Add Student, + Create Exam) */}
        {onQuickAction && quickActionLabel && (
          <button
            onClick={onQuickAction}
            className="hidden sm:flex items-center gap-1.5 bg-primary-orange hover:bg-orange-600 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <Plus size={15} />
            <span>{quickActionLabel}</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-orange dark:hover:text-primary-orange hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Admin Avatar Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-orange to-amber-500 p-0.5 shadow-xs shrink-0">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={`${API_BASE_URL}${user.profileImage}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-black text-primary-orange">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] font-extrabold uppercase text-primary-orange tracking-widest">
              Admin
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all ml-1"
            title="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
