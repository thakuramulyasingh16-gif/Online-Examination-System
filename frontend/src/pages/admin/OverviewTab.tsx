import React from 'react';
import {
  Users,
  BookOpen,
  Radio,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import type { AdminTab } from './AdminSidebar';
import { Skeleton } from '../../components/ui/Skeleton';

interface OverviewStats {
  totalStudents: number;
  activeStudentsCount: number;
  totalExams: number;
  liveExams: number;
  averageScore: number;
  totalAttempts: number;
  totalWarnings: number;
  passFailDonut: {
    passed: number;
    failed: number;
  };
  examWiseAverage: {
    examTitle: string;
    fullTitle: string;
    avgScore: number;
    attempts: number;
    passed: number;
    failed: number;
  }[];
  last7DaysAttempts: {
    date: string;
    attempts: number;
    avgScore: number;
  }[];
  recentActivity: {
    id: string;
    type: 'submission' | 'warning' | 'exam_created' | 'student_registered';
    title: string;
    description: string;
    timestamp: string;
    badge?: string;
    badgeColor?: string;
  }[];
}

interface OverviewTabProps {
  stats: OverviewStats | null;
  loading: boolean;
  onNavigateTab: (tab: AdminTab) => void;
}

const DONUT_COLORS = ['#10B981', '#EF4444']; // green-500, rose-500

const formatTimeAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  loading,
  onNavigateTab,
}) => {
  if (loading || !stats) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Stat Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 h-80">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 h-80">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  const donutData = [
    { name: 'Passed', value: stats.passFailDonut?.passed || 0 },
    { name: 'Failed', value: stats.passFailDonut?.failed || 0 },
  ];
  const totalDonut = (stats.passFailDonut?.passed || 0) + (stats.passFailDonut?.failed || 0);
  const passRate = totalDonut > 0 ? Math.round(((stats.passFailDonut?.passed || 0) / totalDonut) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Stat Cards Grid (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Total Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-blue-500 hover:shadow-elevated hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalStudents}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.activeStudentsCount} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
            Manage student records <ArrowUpRight size={12} />
          </p>
        </div>

        {/* Total Exams */}
        <div
          onClick={() => onNavigateTab('exams')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-primary-orange hover:shadow-elevated hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Total Exams
            </span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-primary-orange group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalExams}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Assessments
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-primary-orange transition-colors">
            Configure assessments <ArrowUpRight size={12} />
          </p>
        </div>

        {/* Live Exams */}
        <div
          onClick={() => onNavigateTab('exams')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-emerald-500 hover:shadow-elevated hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Live Exams
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Radio size={20} className={stats.liveExams > 0 ? 'animate-pulse text-emerald-500' : ''} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.liveExams}
            </span>
            {stats.liveExams > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                In Session
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
            Active examination windows <ArrowUpRight size={12} />
          </p>
        </div>

        {/* Average Score */}
        <div
          onClick={() => onNavigateTab('results')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-amber-500 hover:shadow-elevated hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Average Score
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.averageScore}%
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {stats.totalAttempts} Attempts
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
            View score distributions <ArrowUpRight size={12} />
          </p>
        </div>

        {/* Total Warnings */}
        <div
          onClick={() => onNavigateTab('proctoring')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-rose-500 hover:shadow-elevated hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Total Warnings
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalWarnings}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Integrity Alerts
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-rose-500 transition-colors">
            Open surveillance desk <ArrowUpRight size={12} />
          </p>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam-wise Average Score Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-orange" /> Exam-wise Average Score
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Performance benchmark across assessments</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 text-primary-orange border border-orange-200/60 dark:border-orange-900/40">
              % Score
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {stats.examWiseAverage.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No exam score data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.examWiseAverage} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="examTitle"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <p className="font-bold text-amber-400">{data.fullTitle}</p>
                            <p className="text-slate-300">Avg Score: <span className="font-extrabold text-white">{data.avgScore}%</span></p>
                            <p className="text-slate-400">Attempts: <span className="text-slate-200">{data.attempts}</span> (Passed: {data.passed}, Failed: {data.failed})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="avgScore"
                    fill="url(#orangeGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={45}
                  />
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pass / Fail Donut Chart (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award size={18} className="text-emerald-500" /> Pass vs Fail Ratio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Overall qualification status</p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {totalDonut} Total
            </span>
          </div>

          <div className="h-56 sm:h-64 relative flex items-center justify-center">
            {totalDonut === 0 ? (
              <div className="text-slate-400 text-sm text-center">No submissions recorded yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} Candidates`, name]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                    {passRate}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                    Pass Rate
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-around items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Passed: {stats.passFailDonut?.passed || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Failed: {stats.passFailDonut?.failed || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Last 7 Days Attempts Trend Line Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attempts Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Last 7 Days Exam Attempts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily candidate test volume and engagement</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              7-Day Activity
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.last7DaysAttempts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-blue-400">{data.date}</p>
                          <p className="text-slate-300">Total Attempts: <span className="font-extrabold text-white">{data.attempts}</span></p>
                          <p className="text-slate-400">Avg Score: <span className="text-slate-200">{data.avgScore}%</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#blueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-primary-orange" /> Recent Activity Feed
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Live Updates</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-80 sm:max-h-[300px]">
            {stats.recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-8">
                <FileText size={28} className="opacity-30 mb-2" />
                <p>No recent activity logs recorded</p>
              </div>
            ) : (
              stats.recentActivity.map((act) => {
                const isPass = act.badge === 'Passed';
                const isFail = act.badge === 'Failed';
                const isWarning = act.type === 'warning';

                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors flex items-start gap-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      {isWarning ? (
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={14} />
                        </div>
                      ) : isPass ? (
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle size={14} />
                        </div>
                      ) : isFail ? (
                        <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          <XCircle size={14} />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                          <Activity size={14} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {act.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatTimeAgo(act.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {act.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
