import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  BookOpen,
  Search,
  ArrowUpDown,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Timer,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

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

const MyExams = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Live' | 'Upcoming' | 'Completed'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'duration-asc' | 'duration-desc' | 'title'>('newest');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams');
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine status
  const getExamStatus = (exam: ExamItem): 'Completed' | 'Upcoming' | 'Live' => {
    if (exam.Results && exam.Results.length > 0) return 'Completed';
    if (exam.scheduledAt) {
      const scheduledTime = new Date(exam.scheduledAt).getTime();
      if (scheduledTime > Date.now()) return 'Upcoming';
    }
    return 'Live';
  };

  // Filtered & Sorted exams
  const filteredExams = useMemo(() => {
    return exams
      .filter((exam) => {
        const matchesSearch =
          exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exam.subject && exam.subject.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        const status = getExamStatus(exam);
        if (activeFilter === 'All') return true;
        return status === activeFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'duration-asc') {
          return a.duration - b.duration;
        }
        if (sortBy === 'duration-desc') {
          return b.duration - a.duration;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [exams, searchQuery, activeFilter, sortBy]);

  // Counts for tabs
  const counts = useMemo(() => {
    const live = exams.filter((e) => getExamStatus(e) === 'Live').length;
    const upcoming = exams.filter((e) => getExamStatus(e) === 'Upcoming').length;
    const completed = exams.filter((e) => getExamStatus(e) === 'Completed').length;
    return { all: exams.length, live, upcoming, completed };
  }, [exams]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-950/40 text-primary-orange rounded-full text-xs font-bold mb-2">
            <BookOpen size={14} /> City College Assessment Catalog
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Examinations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and access your semester examinations and MCQ tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/results"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 size={16} /> Past Records ({counts.completed})
          </Link>
        </div>
      </div>

      {/* Controls: Search, Filter Tabs, Sort */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by exam title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <ArrowUpDown size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-orange/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="duration-asc">Duration: Low to High</option>
              <option value="duration-desc">Duration: High to Low</option>
              <option value="title">Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(
            [
              { label: 'All', key: 'All', count: counts.all },
              { label: 'Live Now', key: 'Live', count: counts.live },
              { label: 'Upcoming', key: 'Upcoming', count: counts.upcoming },
              { label: 'Completed', key: 'Completed', count: counts.completed },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeFilter === tab.key
                  ? 'bg-primary-orange text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const status = getExamStatus(exam);
            const totalQuestions = exam.Questions?.length || 0;
            const totalMarks = exam.Questions
              ? exam.Questions.reduce((sum, q) => sum + (q.marks || 1), 0)
              : 50;
            const examDate = new Date(exam.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <Card
                key={exam.id}
                hoverable
                className="p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-50 dark:bg-orange-950/40 p-3 rounded-2xl text-primary-orange border border-orange-100 dark:border-orange-900/40 shadow-sm group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>

                    <div>
                      {status === 'Completed' && (
                        <Badge variant="success" size="sm" dot>
                          Completed
                        </Badge>
                      )}
                      {status === 'Live' && (
                        <Badge variant="primary" size="sm" dot className="animate-pulse">
                          Live Now
                        </Badge>
                      )}
                      {status === 'Upcoming' && (
                        <Badge variant="warning" size="sm" dot>
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Subject & Title */}
                  <div className="mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-orange">
                      {exam.subject || 'Academic Examination'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-primary-orange transition-colors line-clamp-1">
                      {exam.title}
                    </h3>
                  </div>

                  {/* Metadata Box */}
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
                      <span>Published: {examDate}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-2">
                  {status === 'Completed' ? (
                    <Link
                      to="/results"
                      className="w-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} /> View Scorecard
                    </Link>
                  ) : status === 'Upcoming' ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Timer size={14} /> Scheduled Soon (Locked)
                    </button>
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
          })}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? 'No Matching Examinations Found' : 'No Exams in this Category'}
          description={
            searchQuery
              ? `No tests match your search query "${searchQuery}". Please check your spelling or try clearing the filter.`
              : 'There are no examinations available under this tab.'
          }
        />
      )}
    </div>
  );
};

export default MyExams;
