import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  BarChart3,
  Timer,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useCountUp } from '../hooks/useCountUp';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface QuestionItem {
  id: number;
  marks?: number;
}

interface ExamItem {
  id: number;
  title: string;
  duration: number;
  createdAt: string;
  scheduledAt?: string;
  subject?: string;
  Questions?: QuestionItem[];
  Results?: {
    id: number;
    score: number;
    percentage: number;
    status: string;
    createdAt: string;
  }[];
}

interface ResultItem {
  id: number;
  score: number;
  percentage: number;
  status: string;
  createdAt: string;
  Exam?: {
    id: number;
    title: string;
    duration: number;
    Questions?: QuestionItem[];
  };
}

// Animated Stat Card Component
const StatCard = ({
  title,
  value,
  suffix = '',
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: any;
  color: 'orange' | 'emerald' | 'blue' | 'purple';
  subtitle: string;
}) => {
  const animatedValue = useCountUp(value, 900);

  const colorMap = {
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-primary-orange',
      border: 'border-orange-200/60 dark:border-orange-900/40',
      badge: 'from-orange-500 to-amber-500',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      badge: 'from-emerald-500 to-teal-500',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/60 dark:border-blue-900/40',
      badge: 'from-blue-500 to-indigo-500',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/60 dark:border-purple-900/40',
      badge: 'from-purple-500 to-pink-500',
    },
  }[color];

  return (
    <Card
      hoverable
      className="p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-3 rounded-2xl ${colorMap.bg} ${colorMap.text} ${colorMap.border} border shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {animatedValue}
        </span>
        {suffix && (
          <span className="text-xl font-bold text-slate-500 dark:text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        {subtitle}
      </p>
    </Card>
  );
};

// Exam Card Component with Countdown and Status Logic
const ExamCard = ({ exam }: { exam: ExamItem }) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
  } | null>(null);

  const hasCompleted = exam.Results && exam.Results.length > 0;

  // Determine timing status:
  // An exam can be 'Live', 'Upcoming', or 'Completed'
  // If exam has no scheduledAt, we treat it as Live by default unless completed
  // For demonstration and realistic portal behavior, if created recently (< 1 day) and not completed, it is Live.
  // If scheduled in the future, it's Upcoming.
  const examStatus = useMemo(() => {
    if (hasCompleted) return 'Completed';
    if (exam.scheduledAt) {
      const scheduledDate = new Date(exam.scheduledAt).getTime();
      const now = Date.now();
      if (scheduledDate > now) return 'Upcoming';
    }
    return 'Live';
  }, [hasCompleted, exam.scheduledAt]);

  useEffect(() => {
    if (examStatus !== 'Upcoming' || !exam.scheduledAt) return;

    const interval = setInterval(() => {
      const scheduledDate = new Date(exam.scheduledAt!).getTime();
      const diff = scheduledDate - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPassed: true });
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isPassed: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [examStatus, exam.scheduledAt]);

  // Total Marks Calculation
  const totalQuestions = exam.Questions?.length || 0;
  const totalMarks = exam.Questions
    ? exam.Questions.reduce((sum, q) => sum + (q.marks || 1), 0)
    : 50;

  // Formatted date string
  const examDate = new Date(exam.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card
      hoverable
      className="p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden"
    >
      <div>
        {/* Top Badges */}
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="bg-orange-50 dark:bg-orange-950/40 p-3 rounded-2xl text-primary-orange border border-orange-100 dark:border-orange-900/40 shadow-sm group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>

          <div>
            {examStatus === 'Completed' && (
              <Badge variant="success" size="sm" dot>
                Completed
              </Badge>
            )}
            {examStatus === 'Live' && (
              <Badge variant="primary" size="sm" dot className="animate-pulse">
                Live Now
              </Badge>
            )}
            {examStatus === 'Upcoming' && (
              <Badge variant="warning" size="sm" dot>
                Upcoming
              </Badge>
            )}
          </div>
        </div>

        {/* Title & Subject */}
        <div className="mb-4">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-orange">
            {exam.subject || 'Core Examination'}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-primary-orange transition-colors line-clamp-1">
            {exam.title}
          </h3>
        </div>

        {/* Exam Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary-orange" />
            <span>
              <strong>{exam.duration}</strong> Mins
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-amber-500" />
            <span>
              <strong>{totalMarks}</strong> Marks ({totalQuestions} MCQs)
            </span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Calendar size={14} className="text-slate-400" />
            <span>Date: {examDate}</span>
          </div>
        </div>
      </div>

      {/* Action / Countdown Area */}
      <div className="pt-2">
        {examStatus === 'Completed' ? (
          <Link
            to="/results"
            className="w-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm"
          >
            <CheckCircle2 size={16} /> View Scorecard
          </Link>
        ) : examStatus === 'Upcoming' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200/60 dark:border-amber-900/40">
              <Timer size={14} className="animate-spin" />
              Starts in:{' '}
              {timeLeft
                ? `${String(timeLeft.hours).padStart(2, '0')}:${String(
                    timeLeft.minutes
                  ).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
                : 'Upcoming'}
            </div>
            <button
              disabled
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
            >
              Start Exam (Locked)
            </button>
          </div>
        ) : (
          <Link
            to={`/exam/${exam.id}`}
            className="w-full bg-gradient-to-r from-orange-500 to-primary-orange hover:from-orange-600 hover:to-orange-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg group-hover:scale-[1.02]"
          >
            Start Examination <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </Card>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/results/user'),
      ]);
      setExams(examsRes.data || []);
      setResults(resultsRes.data || []);
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute Statistics
  const totalExams = exams.length;
  const completedExams = results.length;
  const pendingExams = Math.max(0, totalExams - completedExams);
  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + (r.percentage || 0), 0);
    return Math.round((sum / results.length) * 10) / 10;
  }, [results]);

  // Score Trend Chart Data (Last 6 tests)
  const chartData = useMemo(() => {
    if (!results || results.length === 0) return [];
    return [...results]
      .reverse()
      .slice(-6)
      .map((r, idx) => ({
        name: r.Exam?.title ? (r.Exam.title.length > 12 ? `${r.Exam.title.slice(0, 10)}...` : r.Exam.title) : `Test #${idx + 1}`,
        score: Math.round(r.percentage || 0),
      }));
  }, [results]);

  // Today's formatted localized date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* 1. Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-primary-orange to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-elevated flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-md overflow-hidden border-2 border-white/60 shadow-lg shrink-0 flex items-center justify-center">
            {user?.profileImage ? (
              <img
                src={`${API_BASE_URL}${user.profileImage}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white bg-orange-600/50">
                {user?.name?.charAt(0) || 'S'}
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-2">
              <ShieldCheck size={14} /> Verified Student Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Namaste, {user?.name || 'Student'}! 🙏
            </h1>
            <p className="text-orange-100 font-semibold text-xs md:text-sm mt-0.5 flex items-center gap-2">
              <Calendar size={14} /> {todayFormatted}
            </p>
            <p className="text-orange-100/90 text-xs mt-0.5">
              Roll / Login ID: <strong>{user?.loginId}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 z-10 w-full md:w-auto">
          <Link
            to="/my-exams"
            className="flex-1 md:flex-initial bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-white/20 transition-all text-xs md:text-sm text-center"
          >
            My Exams
          </Link>
          <Link
            to="/results"
            className="flex-1 md:flex-initial bg-white text-primary-orange px-5 py-2.5 rounded-2xl font-bold hover:bg-orange-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs md:text-sm"
          >
            <Award size={16} /> View Scorecard
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards with Count-Up Animations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Exams"
          value={totalExams}
          icon={BookOpen}
          color="blue"
          subtitle="Curriculum assessments"
        />
        <StatCard
          title="Completed"
          value={completedExams}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Attempts recorded"
        />
        <StatCard
          title="Pending"
          value={pendingExams}
          icon={Clock}
          color="orange"
          subtitle="Awaiting completion"
        />
        <StatCard
          title="Average Score"
          value={averageScore}
          suffix="%"
          icon={TrendingUp}
          color="purple"
          subtitle="Overall performance"
        />
      </div>

      {/* 3. Available & Upcoming Exams Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="text-primary-orange w-5 h-5 md:w-6 md:h-6" /> Available & Upcoming Exams
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select an active examination session to begin your test.
            </p>
          </div>
          <Link
            to="/my-exams"
            className="text-xs font-bold text-primary-orange hover:text-orange-600 flex items-center gap-1 self-start sm:self-auto"
          >
            Explore all examinations <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-800 animate-pulse p-6 space-y-4"
              >
                <div className="flex justify-between">
                  <Skeleton width={40} height={40} />
                  <Skeleton width={70} height={24} />
                </div>
                <Skeleton width="80%" height={20} />
                <Skeleton width="100%" height={60} />
                <Skeleton width="100%" height={40} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.slice(0, 6).map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}

            {exams.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No Active Examinations"
                  description="You are currently all caught up! When faculty assigns new assessments, they will appear here."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Score-Trend Chart & Recent Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 pt-4">
        {/* Performance Chart (3 cols) */}
        <Card className="lg:col-span-3 p-6 flex flex-col justify-between shadow-card hover:shadow-elevated transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-primary-orange rounded-xl border border-orange-200/50">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Academic Score Trend
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your percentage scores across recent assessments
                  </p>
                </div>
              </div>
              <Badge variant="primary" size="sm">
                Last {chartData.length} Tests
              </Badge>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#888' }}
                      stroke="#888"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#888' }}
                      stroke="#888"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700">
                              <p className="text-orange-300">{payload[0].payload.name}</p>
                              <p className="text-white text-sm">Score: {payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#EA580C"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
                <BarChart3 size={36} className="mb-2 opacity-40 text-primary-orange" />
                <p>Complete at least one exam to view your visual score trend.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Minimum Passing Standard: <strong>40%</strong></span>
            <span className="text-primary-orange font-bold">Target: 85%+ Distinction</span>
          </div>
        </Card>

        {/* Recent Results (2 cols) */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between shadow-card hover:shadow-elevated transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl border border-emerald-200/50">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Recent Results
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Latest examination reviews
                  </p>
                </div>
              </div>
              <Link
                to="/results"
                className="text-xs font-bold text-primary-orange hover:text-orange-600"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {results.slice(0, 4).map((r) => {
                const isPassed = (r.percentage || 0) >= 40;
                return (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-orange-50/40 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {r.Exam?.title || `Exam Attempt #${r.id}`}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {Math.round(r.percentage || 0)}%
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Score: {r.score}
                        </div>
                      </div>
                      <Badge
                        variant={isPassed ? 'success' : 'danger'}
                        size="sm"
                      >
                        {isPassed ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  </div>
                );
              })}

              {results.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                  <AlertCircle size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">
                    No results recorded yet
                  </p>
                  <p>When you finish an examination, your scores will appear here.</p>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/results"
            className="mt-6 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs text-center transition-colors block"
          >
            Detailed Scorecards & Review &rarr;
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
