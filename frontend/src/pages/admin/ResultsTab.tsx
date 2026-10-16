import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import {
  Award,
  Search,
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Info,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config';
import { exportToCSV, exportToExcel, exportResultsPDF } from '../../utils/exportUtils';
import { generateResultPDF } from '../../utils/pdfGenerator';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ExamItem } from './ExamsTab';

export interface ResultItem {
  id: number;
  userId: number;
  examId: number;
  score: number;
  percentage: number;
  status: string;
  answers?: string | null; // serialized JSON
  createdAt: string;
  User?: {
    id: number;
    name: string;
    email: string | null;
    loginId: string;
    profileImage: string | null;
  };
  Exam?: {
    id: number;
    title: string;
    duration: number;
    totalMarks?: number;
    passMarks?: number;
    negativeMarking?: number;
    Questions?: any[];
  };
}

interface ResultsTabProps {
  results: ResultItem[];
  exams: ExamItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  results,
  exams,
  loading,
  onRefresh,
}) => {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_high' | 'score_low'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Detailed Answer Sheet Modal State
  const [showAnswerSheetModal, setShowAnswerSheetModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);

  // Delete Result Confirm Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<ResultItem | null>(null);

  // Filtered Results
  const filteredResults = useMemo(() => {
    let list = [...results];

    // Exam filter
    if (selectedExamFilter !== 'all') {
      const eId = Number(selectedExamFilter);
      list = list.filter((r) => r.examId === eId);
    }

    // Status filter
    if (selectedStatusFilter === 'passed') {
      list = list.filter((r) => (r.percentage || 0) >= (r.Exam?.passMarks || 40) && r.status !== 'terminated');
    } else if (selectedStatusFilter === 'failed') {
      list = list.filter((r) => (r.percentage || 0) < (r.Exam?.passMarks || 40) && r.status !== 'terminated');
    } else if (selectedStatusFilter === 'terminated') {
      list = list.filter((r) => r.status === 'terminated');
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.User?.name?.toLowerCase().includes(term) ||
          r.User?.loginId?.toLowerCase().includes(term) ||
          r.Exam?.title?.toLowerCase().includes(term)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'score_high') return (b.percentage || 0) - (a.percentage || 0);
      if (sortBy === 'score_low') return (a.percentage || 0) - (b.percentage || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [results, selectedExamFilter, selectedStatusFilter, searchTerm, sortBy]);

  // Statistics Summary
  const statsSummary = useMemo(() => {
    const total = filteredResults.length;
    let passed = 0;
    let failed = 0;
    let totalPct = 0;

    filteredResults.forEach((r) => {
      const passMarks = r.Exam?.passMarks || 40;
      if (r.percentage >= passMarks && r.status !== 'terminated') {
        passed++;
      } else {
        failed++;
      }
      totalPct += r.percentage || 0;
    });

    const avgScore = total > 0 ? Math.round(totalPct / total) : 0;
    return { total, passed, failed, avgScore };
  }, [filteredResults]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  // Export Handlers
  const handleExportCSV = () => {
    const rows = filteredResults.map((r, i) => ({
      index: i + 1,
      studentName: r.User?.name || 'Unknown',
      loginId: r.User?.loginId || '-',
      email: r.User?.email || '-',
      examTitle: r.Exam?.title || 'Unknown',
      score: r.score,
      totalMarks: r.Exam?.totalMarks || 100,
      percentage: `${r.percentage}%`,
      status: r.status === 'terminated' ? 'Terminated' : r.percentage >= (r.Exam?.passMarks || 40) ? 'Passed' : 'Failed',
      submittedAt: new Date(r.createdAt).toLocaleString(),
    }));

    exportToCSV('examination_results', rows, [
      { key: 'index', label: '#' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'loginId', label: 'Login ID' },
      { key: 'email', label: 'Email' },
      { key: 'examTitle', label: 'Exam Title' },
      { key: 'score', label: 'Score' },
      { key: 'totalMarks', label: 'Total Marks' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'status', label: 'Status' },
      { key: 'submittedAt', label: 'Submitted At' },
    ]);
  };

  const handleExportExcel = () => {
    const rows = filteredResults.map((r, i) => ({
      index: i + 1,
      studentName: r.User?.name || 'Unknown',
      loginId: r.User?.loginId || '-',
      examTitle: r.Exam?.title || 'Unknown',
      score: r.score,
      totalMarks: r.Exam?.totalMarks || 100,
      percentage: `${r.percentage}%`,
      status: r.status === 'terminated' ? 'Terminated' : r.percentage >= (r.Exam?.passMarks || 40) ? 'Passed' : 'Failed',
      submittedAt: new Date(r.createdAt).toLocaleString(),
    }));

    exportToExcel('examination_results_report', rows, [
      { key: 'index', label: '#' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'loginId', label: 'Login ID' },
      { key: 'examTitle', label: 'Exam Title' },
      { key: 'score', label: 'Score' },
      { key: 'totalMarks', label: 'Total Marks' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'status', label: 'Status' },
      { key: 'submittedAt', label: 'Submitted At' },
    ]);
  };

  const handleExportPDF = () => {
    exportResultsPDF(filteredResults, 'Examination Results Summary');
  };

  // Delete Result Action
  const handleConfirmDeleteResult = async () => {
    if (!resultToDelete) return;
    try {
      await api.delete(`/results/${resultToDelete.id}`);
      toast.success('Result record removed');
      setShowDeleteModal(false);
      setResultToDelete(null);
      onRefresh();
    } catch {
      toast.error('Failed to delete result record');
    }
  };

  // Answer Sheet Calculations
  const answerSheetBreakdown = useMemo(() => {
    if (!selectedResult || !selectedResult.Exam?.Questions) {
      return { correct: 0, wrong: 0, skipped: 0, parsedAnswers: {}, questions: [] };
    }

    let parsedAnswers: Record<string, string> = {};
    try {
      if (selectedResult.answers) {
        parsedAnswers = typeof selectedResult.answers === 'string'
          ? JSON.parse(selectedResult.answers)
          : selectedResult.answers;
      }
    } catch {
      parsedAnswers = {};
    }

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const questionsList = selectedResult.Exam.Questions.map((q: any) => {
      const studentAns = parsedAnswers[q.id];
      const hasAnswered = studentAns !== undefined && studentAns !== null && studentAns !== '';
      const isCorrect = hasAnswered && studentAns === q.correctAnswer;

      if (!hasAnswered) skipped++;
      else if (isCorrect) correct++;
      else wrong++;

      return {
        ...q,
        studentAnswer: studentAns,
        hasAnswered,
        isCorrect,
      };
    });

    return { correct, wrong, skipped, parsedAnswers, questions: questionsList };
  }, [selectedResult]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header with Filters & Export Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Exam Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
            <BookOpen size={15} className="text-primary-orange" />
            <select
              value={selectedExamFilter}
              onChange={(e) => {
                setSelectedExamFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">All Examinations</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed Candidates</option>
              <option value="failed">Failed Candidates</option>
              <option value="terminated">Terminated Sessions</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown size={15} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_high">Score: High to Low</option>
              <option value="score_low">Score: Low to High</option>
            </select>
          </div>

          {/* Search Student */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search candidate name or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
            />
          </div>
        </div>

        {/* Export Buttons: CSV, Excel, PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors shadow-xs"
            title="Export to CSV"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60 transition-colors shadow-xs"
            title="Export to Excel Spreadsheet"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-orange hover:bg-orange-600 active:scale-95 text-white font-bold text-xs transition-all shadow-xs"
            title="Export PDF Report"
          >
            <FileText size={14} /> PDF Report
          </button>
        </div>
      </div>

      {/* 2. Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Attempts</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{statsSummary.total}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">Passed Candidates</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{statsSummary.passed}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">Failed Candidates</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{statsSummary.failed}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">Average Score</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{statsSummary.avgScore}%</span>
        </div>
      </div>

      {/* 3. Results Table with Sticky Header & Row Hover */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-4">Examination</th>
                <th className="py-3.5 px-4">Score &amp; %</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6 space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-44" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-6 text-right"><Skeleton className="h-8 w-28 ml-auto rounded-xl" /></td>
                  </tr>
                ))
              ) : paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <EmptyState
                      title="No results found"
                      description="No exam attempts match the selected filters or search terms."
                    />
                  </td>
                </tr>
              ) : (
                paginatedResults.map((result) => {
                  const passMarks = result.Exam?.passMarks || 40;
                  const isPassed = (result.percentage || 0) >= passMarks && result.status !== 'terminated';
                  const isTerminated = result.status === 'terminated';

                  return (
                    <tr
                      key={result.id}
                      className="hover:bg-orange-50/40 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      {/* Candidate */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {result.User?.profileImage ? (
                              <img
                                src={`${API_BASE_URL}${result.User.profileImage}`}
                                alt={result.User.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-xs text-primary-orange">
                                {result.User?.name?.charAt(0) || 'S'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {result.User?.name || 'Unknown Student'}
                            </p>
                            <p className="text-xs font-mono text-slate-400">
                              ID: {result.User?.loginId || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Examination */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {result.Exam?.title || 'Unknown Exam'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {result.Exam?.duration} Mins Duration
                        </p>
                      </td>

                      {/* Score & % */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {result.score}
                          </span>
                          <span className="text-xs text-slate-400">
                            / {result.Exam?.totalMarks || 100}
                          </span>
                          <span className="text-xs font-bold text-primary-orange ml-1">
                            ({result.percentage}%)
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isTerminated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <XCircle size={12} /> Terminated
                          </span>
                        ) : isPassed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle2 size={12} /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {new Date(result.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detailed Answer Sheet */}
                          <button
                            onClick={() => {
                              setSelectedResult(result);
                              setShowAnswerSheetModal(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-primary-orange font-bold text-xs transition-colors"
                            title="View candidate's detailed answer sheet"
                          >
                            <Eye size={14} /> Answer Sheet
                          </button>

                          {/* Delete Result */}
                          <button
                            onClick={() => {
                              setResultToDelete(result);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                            title="Delete result record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {filteredResults.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>
            <span>to</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {Math.min(currentPage * pageSize, filteredResults.length)}
            </span>
            <span>of</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {filteredResults.length} records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-3 font-bold text-slate-800 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 4. Student-wise Detailed Answer Sheet Modal */}
      {showAnswerSheetModal && selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Award className="text-primary-orange" size={20} />
                  Candidate Evaluation &amp; Answer Sheet
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed breakdown of responses, correct answers and explanation
                </p>
              </div>
              <button
                onClick={() => setShowAnswerSheetModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Candidate Info Ribbon */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate</span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">
                    {selectedResult.User?.name}
                  </span>
                  <span className="text-slate-400 block font-mono">ID: {selectedResult.User?.loginId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assessment</span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">
                    {selectedResult.Exam?.title}
                  </span>
                  <span className="text-slate-400 block">{selectedResult.Exam?.duration} Minutes</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Score &amp; %</span>
                  <span className="font-black text-primary-orange text-sm">
                    {selectedResult.score} / {selectedResult.Exam?.totalMarks || 100}
                  </span>
                  <span className="font-bold text-slate-600 dark:text-slate-300 block">
                    {selectedResult.percentage}% Score
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Verdict</span>
                  {selectedResult.status === 'terminated' ? (
                    <span className="text-rose-600 font-black">Terminated</span>
                  ) : selectedResult.percentage >= (selectedResult.Exam?.passMarks || 40) ? (
                    <span className="text-emerald-600 font-black">Passed</span>
                  ) : (
                    <span className="text-rose-600 font-black">Failed</span>
                  )}
                </div>
              </div>

              {/* Accuracy Counts Bar */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                  <CheckCircle2 size={15} />
                  <span>Correct: {answerSheetBreakdown.correct}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
                  <XCircle size={15} />
                  <span>Incorrect: {answerSheetBreakdown.wrong}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <HelpCircle size={15} />
                  <span>Skipped: {answerSheetBreakdown.skipped}</span>
                </div>
              </div>

              {/* Question by Question Review */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Detailed Responses ({answerSheetBreakdown.questions.length} Questions)
                </h4>

                {answerSheetBreakdown.questions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No question breakdown available for this exam.</p>
                ) : (
                  answerSheetBreakdown.questions.map((q: any, i: number) => {
                    const studentAns = q.studentAnswer;
                    const isCorrect = q.isCorrect;
                    const hasAnswered = q.hasAnswered;

                    return (
                      <div
                        key={q.id || i}
                        className={`p-4 rounded-2xl border text-xs space-y-3 transition-colors ${
                          !hasAnswered
                            ? 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                            : isCorrect
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        }`}
                      >
                        {/* Question Prompt Header */}
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-bold text-slate-900 dark:text-white leading-relaxed">
                            <span className="font-mono text-slate-400 mr-2">Q{i + 1}.</span>
                            {q.question}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {q.difficulty && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {q.difficulty}
                              </span>
                            )}
                            <span className="font-mono font-bold text-slate-500">
                              {q.marks || 1} Pt
                            </span>
                          </div>
                        </div>

                        {/* Options Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
                          {[
                            { key: 'option1', label: 'A', text: q.option1 },
                            { key: 'option2', label: 'B', text: q.option2 },
                            { key: 'option3', label: 'C', text: q.option3 },
                            { key: 'option4', label: 'D', text: q.option4 },
                          ].map((opt) => {
                            const isCorrectOpt = q.correctAnswer === opt.key;
                            const isSelectedOpt = studentAns === opt.key;

                            return (
                              <div
                                key={opt.key}
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  isCorrectOpt
                                    ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                                    : isSelectedOpt && !isCorrectOpt
                                    ? 'bg-rose-100/70 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-bold line-through'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="truncate">
                                  <strong>{opt.label}:</strong> {opt.text}
                                </span>
                                {isCorrectOpt && (
                                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                                    ✓ Correct Key
                                  </span>
                                )}
                                {isSelectedOpt && !isCorrectOpt && (
                                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-2">
                                    ✗ Student Choice
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Note */}
                        {q.explanation && (
                          <div className="p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
                            <Info size={14} className="text-primary-orange shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-900 dark:text-white">Explanation: </strong>
                              {q.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer with Single PDF Download */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  generateResultPDF({
                    studentName: selectedResult.User?.name || 'Student',
                    loginId: selectedResult.User?.loginId || '-',
                    examTitle: selectedResult.Exam?.title || 'Exam',
                    examDate: new Date(selectedResult.createdAt).toLocaleDateString(),
                    score: selectedResult.score,
                    totalMarks: selectedResult.Exam?.totalMarks || 100,
                    percentage: selectedResult.percentage,
                    status: selectedResult.status,
                    isPassed: selectedResult.percentage >= (selectedResult.Exam?.passMarks || 40),
                    correctCount: answerSheetBreakdown.correct,
                    wrongCount: answerSheetBreakdown.wrong,
                    skippedCount: answerSheetBreakdown.skipped,
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <Download size={14} /> Download Student Scorecard PDF
              </button>

              <button
                type="button"
                onClick={() => setShowAnswerSheetModal(false)}
                className="px-5 py-2 rounded-xl bg-primary-orange text-white font-bold text-xs hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Result Confirmation Modal */}
      {showDeleteModal && resultToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Confirm Result Record Deletion
                </h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this result for candidate{' '}
              <strong className="text-slate-900 dark:text-white">
                "{resultToDelete.User?.name}"
              </strong>{' '}
              in <strong className="text-slate-900 dark:text-white">"{resultToDelete.Exam?.title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setResultToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteResult}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-950/30 transition-all"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
