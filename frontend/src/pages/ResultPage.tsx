import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Search,
  Download,
  HelpCircle,
  Calendar,
  ChevronRight,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { generateResultPDF } from '../utils/pdfGenerator';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface QuestionItem {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: string;
  marks?: number;
}

interface ResultItem {
  id: number;
  userId: number;
  examId: number;
  score: number;
  percentage: number;
  status: string;
  createdAt: string;
  User?: {
    name: string;
    loginId: string;
    email: string;
  };
  Exam?: {
    id: number;
    title: string;
    duration: number;
    Questions?: QuestionItem[];
  };
}

const COLORS = {
  correct: '#10B981', // emerald-500
  wrong: '#EF4444',   // rose-500
  skipped: '#F59E0B', // amber-500
};

const ResultPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);

  const fetchResults = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/results/all' : '/results/user';
      const { data } = await api.get(endpoint);
      setResults(data || []);
      if (data && data.length > 0) {
        setSelectedResultId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const studentName = result.User?.name?.toLowerCase() || '';
      const examTitle = result.Exam?.title?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return studentName.includes(search) || examTitle.includes(search);
    });
  }, [results, searchTerm]);

  // Selected Result for detailed view
  const activeResult = useMemo(() => {
    if (!selectedResultId && filteredResults.length > 0) return filteredResults[0];
    return results.find((r) => r.id === selectedResultId) || filteredResults[0] || null;
  }, [results, selectedResultId, filteredResults]);

  // Retrieve cached student answers from localStorage
  const cachedAnswers = useMemo(() => {
    if (!activeResult || !user) return {};
    try {
      const raw = localStorage.getItem(`exam_answers_${activeResult.examId}_${user.id}`);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }, [activeResult, user]);

  // Compute breakdown for the active result
  const breakdown = useMemo(() => {
    if (!activeResult) return { correct: 0, wrong: 0, skipped: 0, total: 0 };

    const questions = activeResult.Exam?.Questions || [];
    const totalQuestions = questions.length || 1;

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    if (Object.keys(cachedAnswers).length > 0) {
      questions.forEach((q) => {
        const studentAns = cachedAnswers[q.id];
        if (!studentAns) {
          skipped += 1;
        } else if (studentAns === q.correctAnswer) {
          correct += 1;
        } else {
          wrong += 1;
        }
      });
    } else {
      // Fallback calculation from score
      correct = Math.min(activeResult.score, totalQuestions);
      wrong = Math.max(0, totalQuestions - correct);
      skipped = 0;
    }

    return { correct, wrong, skipped, total: totalQuestions };
  }, [activeResult, cachedAnswers]);

  // Donut chart dataset
  const donutData = useMemo(() => {
    return [
      { name: 'Correct', value: breakdown.correct, color: COLORS.correct },
      { name: 'Wrong', value: breakdown.wrong, color: COLORS.wrong },
      { name: 'Skipped', value: breakdown.skipped, color: COLORS.skipped },
    ].filter((item) => item.value > 0);
  }, [breakdown]);

  // PDF Export Trigger
  const handleDownloadPDF = () => {
    if (!activeResult) return;

    const questionsReview = (activeResult.Exam?.Questions || []).map((q) => {
      const studentAns = cachedAnswers[q.id];
      const isCorrect = studentAns === q.correctAnswer;
      return {
        question: q.question,
        studentAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const isPassed = (activeResult.percentage || 0) >= 40;
    const totalMarks =
      activeResult.Exam?.Questions?.reduce((acc, q) => acc + (q.marks || 1), 0) ||
      breakdown.total;

    generateResultPDF({
      studentName: activeResult.User?.name || user?.name || 'Student',
      loginId: activeResult.User?.loginId || user?.loginId || 'N/A',
      examTitle: activeResult.Exam?.title || 'Examination Assessment',
      examDate: new Date(activeResult.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      score: activeResult.score,
      totalMarks,
      percentage: activeResult.percentage,
      status: activeResult.status,
      isPassed,
      correctCount: breakdown.correct,
      wrongCount: breakdown.wrong,
      skippedCount: breakdown.skipped,
      questions: questionsReview,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-primary-orange rounded-full text-xs font-bold mb-2">
            <Award size={14} /> Academic Performance Records
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Examination Results & Scorecards
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review detailed question-by-question explanations, performance metrics, and download certified scorecards.
          </p>
        </div>

        {activeResult && (
          <button
            onClick={handleDownloadPDF}
            className="bg-primary-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Download size={16} /> Download Result PDF
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton height={60} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
            </div>
            <div className="lg:col-span-8 space-y-4">
              <Skeleton height={200} />
              <Skeleton height={300} />
            </div>
          </div>
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No Examination Results Yet"
          description="You haven't completed any assessments yet. When you take an exam, your score breakdown and certified certificate will be available here."
        />
      ) : (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by exam title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Main Layout: Left = Attempt List (4 cols), Right = Detailed Review (8 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Attempts List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Completed Assessments ({filteredResults.length})
              </h3>

              <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                {filteredResults.map((r) => {
                  const isSelected = activeResult?.id === r.id;
                  const isPassed = (r.percentage || 0) >= 40;
                  const examDate = new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <Card
                      key={r.id}
                      hoverable
                      onClick={() => setSelectedResultId(r.id)}
                      className={`p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-orange ring-2 ring-primary-orange/20 shadow-md bg-orange-50/20 dark:bg-orange-950/20'
                          : 'hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="overflow-hidden">
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {r.Exam?.title || `Assessment #${r.id}`}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={12} /> {examDate}
                          </p>
                        </div>

                        <Badge
                          variant={isPassed ? 'success' : 'danger'}
                          size="sm"
                          dot
                        >
                          {isPassed ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">
                          Score: <strong className="text-slate-900 dark:text-white">{r.score}</strong>
                        </span>
                        <div className="flex items-center gap-1 font-black text-slate-900 dark:text-white">
                          <span>{Math.round(r.percentage || 0)}%</span>
                          <ChevronRight size={14} className="text-primary-orange" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right Detailed Review Panel (8 cols) */}
            {activeResult && (
              <div className="lg:col-span-8 space-y-6">
                {/* Scorecard Hero Banner */}
                <Card className="p-6 overflow-hidden relative shadow-card">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-orange">
                        Official Academic Transcript
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                        {activeResult.Exam?.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Submitted on{' '}
                        {new Date(activeResult.createdAt).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={activeResult.percentage >= 40 ? 'success' : 'danger'}
                        size="md"
                        dot
                      >
                        {activeResult.percentage >= 40 ? 'Passed (Satisfactory)' : 'Failed'}
                      </Badge>
                      <button
                        onClick={handleDownloadPDF}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-200 hover:text-primary-orange transition-colors"
                        title="Download Certificate PDF"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Donut Chart & Score Overview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
                    {/* Donut Chart (5 cols) */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center">
                      <div className="w-48 h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={donutData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {donutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Donut Center Metric */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {Math.round(activeResult.percentage || 0)}%
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Score
                          </span>
                        </div>
                      </div>

                      {/* Donut Legend */}
                      <div className="flex items-center gap-3 mt-3 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span>Correct ({breakdown.correct})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span>Wrong ({breakdown.wrong})</span>
                        </div>
                        {breakdown.skipped > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span>Skipped ({breakdown.skipped})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score Metrics Grid (7 cols) */}
                    <div className="md:col-span-7 grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Score Obtained
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {activeResult.score}{' '}
                          <span className="text-xs font-semibold text-slate-400">
                            / {breakdown.total}
                          </span>
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Percentage
                        </span>
                        <p className="text-xl font-black text-primary-orange mt-1">
                          {activeResult.percentage.toFixed(1)}%
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Correct Answers
                        </span>
                        <p className="text-xl font-black text-emerald-600 mt-1">
                          {breakdown.correct}
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Exam Duration
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {activeResult.Exam?.duration} Mins
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Question-By-Question Detailed Review */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <FileCheck className="text-primary-orange" size={18} />
                      Detailed Question Review & Explanations
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {activeResult.Exam?.Questions?.length || 0} Questions
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(activeResult.Exam?.Questions || []).map((q, idx) => {
                      const studentAns = cachedAnswers[q.id];
                      const isCorrect = studentAns === q.correctAnswer;
                      const isSkipped = !studentAns;

                      return (
                        <Card
                          key={q.id}
                          className="p-5 md:p-6 space-y-4 border border-slate-200/90 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center text-xs font-black shrink-0">
                                {idx + 1}
                              </span>
                              <p className="font-bold text-sm md:text-base text-slate-900 dark:text-white pt-1">
                                {q.question}
                              </p>
                            </div>

                            {isCorrect ? (
                              <Badge variant="success" size="sm">
                                <Check size={12} /> Correct (+1)
                              </Badge>
                            ) : isSkipped ? (
                              <Badge variant="warning" size="sm">
                                Skipped (0)
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="sm">
                                <X size={12} /> Wrong (0)
                              </Badge>
                            )}
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-0 md:pl-11">
                            {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => {
                              const isThisCorrect = opt === q.correctAnswer;
                              const isThisStudent = studentAns === opt;

                              let cardStyle =
                                'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300';

                              if (isThisCorrect) {
                                cardStyle =
                                  'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                              } else if (isThisStudent && !isCorrect) {
                                cardStyle =
                                  'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
                              }

                              return (
                                <div
                                  key={i}
                                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${cardStyle}`}
                                >
                                  <span>{opt}</span>
                                  <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                                    {isThisCorrect && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold flex items-center gap-1">
                                        <Check size={10} /> Correct Answer
                                      </span>
                                    )}
                                    {isThisStudent && !isThisCorrect && (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold flex items-center gap-1">
                                        <X size={10} /> Your Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation Box */}
                          <div className="ml-0 md:ml-11 p-3.5 bg-orange-50/60 dark:bg-orange-950/20 rounded-xl border border-orange-200/70 dark:border-orange-900/40 text-xs space-y-1">
                            <span className="font-extrabold text-primary-orange flex items-center gap-1.5">
                              <HelpCircle size={14} /> Concept & Academic Explanation:
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              The correct option is <strong>"{q.correctAnswer}"</strong>. This aligns with standard curriculum specifications for {activeResult.Exam?.title || 'this topic'}. Ensure you review this unit before future evaluations.
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
