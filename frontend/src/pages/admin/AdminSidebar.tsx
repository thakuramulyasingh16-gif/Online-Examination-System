import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  BarChart2,
  Monitor,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export type AdminTab =
  | 'overview'
  | 'students'
  | 'exams'
  | 'questions'
  | 'results'
  | 'proctoring'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  liveCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collegeInfo?: {
    collegeName: string;
    collegeLogo: string;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  liveCount,
  mobileOpen,
  onCloseMobile,
  collegeInfo,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'students',
      label: 'Students',
      icon: <Users size={20} />,
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: <BookOpen size={20} />,
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: <HelpCircle size={20} />,
    },
    {
      id: 'results',
      label: 'Results',
      icon: <BarChart2 size={20} />,
    },
    {
      id: 'proctoring',
      label: 'Live Proctoring',
      icon: <Monitor size={20} />,
      badge: liveCount > 0 ? `${liveCount} Live` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={collegeInfo?.collegeLogo || '/logo.jpg'}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover border border-orange-500/40 shrink-0 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.jpg';
              }}
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-white truncate tracking-tight">
                  {collegeInfo?.collegeName || 'City College'}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-orange flex items-center gap-1">
                  <ShieldCheck size={11} /> Admin Panel
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Live Proctoring Banner (if active) */}
        {liveCount > 0 && !collapsed && (
          <div
            onClick={() => {
              onSelectTab('proctoring');
              onCloseMobile();
            }}
            className="mx-3 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between cursor-pointer hover:bg-rose-500/20 transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold text-rose-300 group-hover:text-white">
                {liveCount} Active Student{liveCount > 1 ? 's' : ''}
              </span>
            </div>
            <Radio size={14} className="text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-orange to-amber-600 text-white shadow-md shadow-orange-950/40 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-orange'}`}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Active Indicator Dot */}
                {collapsed && isActive && (
                  <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Pill & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-primary-orange font-bold text-sm shrink-0 overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={`${API_BASE_URL}${user.profileImage}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</span>
                  <span className="text-[10px] font-semibold text-slate-400 truncate">@{user?.loginId || 'admin'}</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut size={17} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
