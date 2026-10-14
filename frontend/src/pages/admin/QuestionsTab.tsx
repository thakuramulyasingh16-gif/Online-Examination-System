import React, { useState, useMemo, useRef, useEffect } from 'react';
import api from '../../services/api';
import {
  HelpCircle,
  Plus,
  Upload,
  Search,
  Trash2,
  Edit,
  Copy,
  BookOpen,
  CheckCircle2,
  X,
  AlertTriangle,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { exportToCSV } from '../../utils/exportUtils';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ExamItem } from './ExamsTab';

export interface QuestionItem {
  id: number;
  examId: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: string;
  marks: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  explanation?: string | null;
  createdAt?: string;
  Exam?: {
    id: number;
    title: string;
    subject?: string | null;
  };
}

interface QuestionsTabProps {
  exams: ExamItem[];
  selectedExamId?: number | null;
  onSelectExamId?: (id: number | null) => void;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({
  exams,
  selectedExamId = null,
  onSelectExamId,
}) => {
  const { toast } = useToast();

  const [activeExamId, setActiveExamId] = useState<number | null>(selectedExamId);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formExamId, setFormExamId] = useState<number>(exams[0]?.id || 1);
  const [formQuestion, setFormQuestion] = useState('');
  const [formOption1, setFormOption1] = useState('');
  const [formOption2, setFormOption2] = useState('');
  const [formOption3, setFormOption3] = useState('');
  const [formOption4, setFormOption4] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('option1');
  const [formMarks, setFormMarks] = useState('1');
  const [formDifficulty, setFormDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [formExplanation, setFormExplanation] = useState('');

  // Bulk Import Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkExamId, setBulkExamId] = useState<number>(exams[0]?.id || 1);
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<any[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy to Exam Modal
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [questionToCopy, setQuestionToCopy] = useState<QuestionItem | null>(null);
  const [copyTargetExamId, setCopyTargetExamId] = useState<number>(exams[0]?.id || 1);

  // Delete Confirm Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionItem | null>(null);

  // Update active exam if prop changes
  useEffect(() => {
    if (selectedExamId !== undefined) {
      setActiveExamId(selectedExamId);
    }
  }, [selectedExamId]);

  // Fetch Questions (either by examId or all for Question Bank)
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      if (activeExamId) {
        const { data } = await api.get(`/questions/exam/${activeExamId}`);
        setQuestions(data || []);
      } else {
        const { data } = await api.get('/questions/all');
        setQuestions(data || []);
      }
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeExamId]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormExamId(activeExamId || exams[0]?.id || 1);
    setFormQuestion('');
    setFormOption1('');
    setFormOption2('');
    setFormOption3('');
    setFormOption4('');
    setFormCorrectAnswer('option1');
    setFormMarks('1');
    setFormDifficulty('Medium');
    setFormExplanation('');
    setShowModal(true);
  };

  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormExamId(q.examId);
    setFormQuestion(q.question);
    setFormOption1(q.option1);
    setFormOption2(q.option2);
    setFormOption3(q.option3);
    setFormOption4(q.option4);
    setFormCorrectAnswer(q.correctAnswer);
    setFormMarks(String(q.marks || 1));
    setFormDifficulty((q.difficulty as any) || 'Medium');
    setFormExplanation(q.explanation || '');
    setShowModal(true);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formOption1.trim() || !formOption2.trim() || !formOption3.trim() || !formOption4.trim()) {
      toast.error('Question prompt and all 4 options are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        examId: formExamId,
        question: formQuestion.trim(),
        option1: formOption1.trim(),
        option2: formOption2.trim(),
        option3: formOption3.trim(),
        option4: formOption4.trim(),
        correctAnswer: formCorrectAnswer,
        marks: parseInt(formMarks) || 1,
        difficulty: formDifficulty,
        explanation: formExplanation.trim() || null,
      };

      if (editingQuestion) {
        await api.put(`/questions/${editingQuestion.id}`, payload);
        toast.success('Question updated successfully');
      } else {
        await api.post('/questions', payload);
        toast.success('New question added successfully');
      }

      setShowModal(false);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      await api.delete(`/questions/${questionToDelete.id}`);
      toast.success('Question deleted successfully');
      setShowDeleteModal(false);
      setQuestionToDelete(null);
      fetchQuestions();
    } catch {
      toast.error('Failed to delete question');
    }
  };

  // Copy to another exam
  const handleExecuteCopy = async () => {
    if (!questionToCopy) return;
    try {
      await api.post(`/questions/${questionToCopy.id}/copy`, { targetExamId: copyTargetExamId });
      toast.success('Question copied to target exam successfully!');
      setShowCopyModal(false);
      setQuestionToCopy(null);
      fetchQuestions();
    } catch {
      toast.error('Failed to copy question');
    }
  };

  // Bulk CSV Import
  const handleDownloadSampleCSV = () => {
    const sample = [
      {
        question: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'option1',
        marks: '1',
        difficulty: 'Easy',
        explanation: 'Paris is the capital and most populous city of France.',
      },
      {
        question: 'Which data structure follows LIFO order?',
        option1: 'Queue',
        option2: 'Stack',
        option3: 'Linked List',
        option4: 'Tree',
        correctAnswer: 'option2',
        marks: '2',
        difficulty: 'Medium',
        explanation: 'Stack uses Last-In First-Out (LIFO) order of execution.',
      },
    ];
    exportToCSV('sample_questions_import', sample, [
      { key: 'question', label: 'question' },
      { key: 'option1', label: 'option1' },
      { key: 'option2', label: 'option2' },
      { key: 'option3', label: 'option3' },
      { key: 'option4', label: 'option4' },
      { key: 'correctAnswer', label: 'correctAnswer' },
      { key: 'marks', label: 'marks' },
      { key: 'difficulty', label: 'difficulty' },
      { key: 'explanation', label: 'explanation' },
    ]);
  };

  const handleCSVFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error('CSV file has no question rows');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
      const parsed: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length === 0 || !cols[0]) continue;

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] || '';
        });

        parsed.push({
          examId: bulkExamId,
          question: rowObj.question || cols[0] || '',
          option1: rowObj.option1 || cols[1] || '',
          option2: rowObj.option2 || cols[2] || '',
          option3: rowObj.option3 || cols[3] || '',
          option4: rowObj.option4 || cols[4] || '',
          correctAnswer: rowObj.correctanswer || cols[5] || 'option1',
          marks: parseInt(rowObj.marks || cols[6]) || 1,
          difficulty: rowObj.difficulty || cols[7] || 'Medium',
          explanation: rowObj.explanation || cols[8] || '',
        });
      }

      setBulkParsedQuestions(parsed);
      toast.info(`Parsed ${parsed.length} questions from CSV`);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkUpload = async () => {
    if (bulkParsedQuestions.length === 0) return;
    setIsBulkUploading(true);
    try {
      const payload = bulkParsedQuestions.map((q) => ({
        ...q,
        examId: bulkExamId,
      }));
      await api.post('/questions/bulk', payload);
      toast.success(`Successfully imported ${payload.length} questions!`);
      setShowBulkModal(false);
      setBulkParsedQuestions([]);
      setBulkFileName('');
      fetchQuestions();
    } catch {
      toast.error('Failed to import questions');
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Difficulty
      if (difficultyFilter !== 'all' && (q.difficulty || 'Medium') !== difficultyFilter) {
        return false;
      }

      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const inPrompt = q.question.toLowerCase().includes(term);
        const inOpts =
          q.option1.toLowerCase().includes(term) ||
          q.option2.toLowerCase().includes(term) ||
          q.option3.toLowerCase().includes(term) ||
          q.option4.toLowerCase().includes(term);
        const inExp = (q.explanation || '').toLowerCase().includes(term);
        return inPrompt || inOpts || inExp;
      }

      return true;
    });
  }, [questions, difficultyFilter, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800">
        {/* Exam Selector / Question Bank toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
            <BookOpen size={16} className="text-primary-orange" />
            <select
              value={activeExamId === null ? '' : activeExamId}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                setActiveExamId(val);
                if (onSelectExamId) onSelectExamId(val);
              }}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[220px] sm:max-w-[300px] truncate"
            >
              <option value="">📁 Question Bank (All Exams)</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} {ex.subject ? `(${ex.subject})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  difficultyFilter === diff
                    ? 'bg-white dark:bg-slate-700 text-primary-orange shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search question, choice..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
            />
          </div>

          <button
            onClick={() => {
              setBulkParsedQuestions([]);
              setBulkFileName('');
              setBulkExamId(activeExamId || exams[0]?.id || 1);
              setShowBulkModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Upload size={15} />
            <span>Bulk CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-primary-orange hover:bg-orange-600 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* 2. Questions Table with Sticky Header & Row Hover */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">Question &amp; Options</th>
                <th className="py-3.5 px-4">Exam</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Marks</th>
                <th className="py-3.5 px-4">Correct Key</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6 space-y-2">
                      <Skeleton className="h-4 w-72" />
                      <Skeleton className="h-3 w-48" />
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-20 rounded-lg" /></td>
                    <td className="py-4 px-6 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-xl" /></td>
                  </tr>
                ))
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <EmptyState
                      title="No questions found"
                      description={
                        searchTerm || difficultyFilter !== 'all'
                          ? 'Try adjusting your search criteria or difficulty filter.'
                          : 'Add your first question or import in bulk using CSV.'
                      }
                      actionLabel="+ Add Question"
                      onAction={openAddModal}
                    />
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isExpanded = expandedRow === q.id;
                  const difficulty = q.difficulty || 'Medium';

                  return (
                    <React.Fragment key={q.id}>
                      <tr className="hover:bg-orange-50/40 dark:hover:bg-slate-800/60 transition-colors group">
                        {/* Question Prompt */}
                        <td className="py-4 px-6 max-w-md">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-xs font-bold text-slate-400 mt-0.5">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white leading-snug">
                                {q.question}
                              </p>
                              {/* Quick Choices Preview */}
                              <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <span className={`px-2 py-0.5 rounded-md ${q.correctAnswer === 'option1' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                  A: {q.option1}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md ${q.correctAnswer === 'option2' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                  B: {q.option2}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md ${q.correctAnswer === 'option3' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                  C: {q.option3}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md ${q.correctAnswer === 'option4' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                  D: {q.option4}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Exam Title */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-semibold">
                          {q.Exam?.title || exams.find((e) => e.id === q.examId)?.title || `Exam #${q.examId}`}
                        </td>

                        {/* Difficulty Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : difficulty === 'Hard'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {difficulty}
                          </span>
                        </td>

                        {/* Marks */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs font-bold text-slate-800 dark:text-slate-200">
                          {q.marks || 1} Pt
                        </td>

                        {/* Correct Key */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1 w-fit">
                            <CheckCircle2 size={13} />
                            {q.correctAnswer.toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Explanation Details */}
                            {q.explanation && (
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : q.id)}
                                className={`p-2 rounded-xl transition-all ${isExpanded ? 'text-primary-orange bg-orange-50 dark:bg-orange-950/40' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                                title={isExpanded ? 'Hide explanation' : 'Show explanation'}
                              >
                                <Info size={16} />
                              </button>
                            )}

                            {/* Copy Question to another Exam Button */}
                            <button
                              onClick={() => {
                                setQuestionToCopy(q);
                                setCopyTargetExamId(exams.find((e) => e.id !== q.examId)?.id || exams[0]?.id || 1);
                                setShowCopyModal(true);
                              }}
                              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"
                              title="Clone to another Exam"
                            >
                              <Copy size={16} />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(q)}
                              className="p-2 rounded-xl text-slate-500 hover:text-primary-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-all"
                              title="Edit Question"
                            >
                              <Edit size={16} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                setQuestionToDelete(q);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                              title="Delete Question"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Explanation Row */}
                      {isExpanded && q.explanation && (
                        <tr className="bg-slate-50/80 dark:bg-slate-850 border-y border-slate-200/60 dark:border-slate-800">
                          <td colSpan={6} className="py-3 px-8">
                            <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                              <Info size={16} className="text-primary-orange shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-800 dark:text-white block mb-0.5">
                                  Explanation &amp; Solution Rationale:
                                </span>
                                <p className="leading-relaxed">{q.explanation}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <HelpCircle className="text-primary-orange" size={20} />
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Exam Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Assessment <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formExamId}
                  onChange={(e) => setFormExamId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} {ex.subject ? `(${ex.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Prompt <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Enter the question statement clearly..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Multiple Choice Options (Select radio next to correct answer) <span className="text-rose-500">*</span>
                </label>

                {[
                  { key: 'option1', label: 'Option A', val: formOption1, setter: setFormOption1 },
                  { key: 'option2', label: 'Option B', val: formOption2, setter: setFormOption2 },
                  { key: 'option3', label: 'Option C', val: formOption3, setter: setFormOption3 },
                  { key: 'option4', label: 'Option D', val: formOption4, setter: setFormOption4 },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formCorrectAnswer === opt.key}
                      onChange={() => setFormCorrectAnswer(opt.key)}
                      className="w-4 h-4 text-primary-orange focus:ring-primary-orange cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={opt.val}
                      onChange={(e) => opt.setter(e.target.value)}
                      placeholder={`${opt.label} text...`}
                      className={`flex-1 px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border ${formCorrectAnswer === opt.key ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white focus:outline-none`}
                    />
                  </div>
                ))}
              </div>

              {/* Difficulty & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e: any) => setFormDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  >
                    <option value="Easy">Easy (Foundation)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="Hard">Hard (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMarks}
                    onChange={(e) => setFormMarks(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>
              </div>

              {/* Explanation Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation &amp; Solution Rationale (Shown in result review)
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-primary-orange hover:bg-orange-600 text-white shadow-md shadow-orange-950/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Bulk Import Questions CSV Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Upload className="text-primary-orange" size={20} />
                  Bulk Import Questions via CSV
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import multiple questions with choices, answers and explanations
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Select Target Exam */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Target Exam
                </label>
                <select
                  value={bulkExamId}
                  onChange={(e) => setBulkExamId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} {ex.subject ? `(${ex.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Template Download */}
              <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Download Sample Questions CSV</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Includes columns for question, 4 choices, correctAnswer, marks, difficulty, explanation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-orange text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-xs"
                >
                  <Download size={14} /> Download Sample
                </button>
              </div>

              {/* Drag & Drop File Selector */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-orange dark:hover:border-primary-orange rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                <Upload size={32} className="mx-auto text-primary-orange mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {bulkFileName ? bulkFileName : 'Click to select CSV question file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports standard UTF-8 .csv files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCSVFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview Table */}
              {bulkParsedQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Parsed Preview ({bulkParsedQuestions.length} questions ready)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Validated</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-bold text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="p-2">Question</th>
                          <th className="p-2">Correct</th>
                          <th className="p-2">Diff</th>
                          <th className="p-2">Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {bulkParsedQuestions.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                            <td className="p-2 font-sans font-medium truncate max-w-xs">{row.question}</td>
                            <td className="p-2 text-emerald-600 font-bold">{row.correctAnswer}</td>
                            <td className="p-2">{row.difficulty}</td>
                            <td className="p-2">{row.marks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkParsedQuestions.length === 0 || isBulkUploading}
                onClick={handleExecuteBulkUpload}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-primary-orange hover:bg-orange-600 text-white shadow-md shadow-orange-950/20 active:scale-95 disabled:opacity-40 transition-all"
              >
                {isBulkUploading ? 'Importing...' : `Import ${bulkParsedQuestions.length} Questions`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Clone Question to Exam Modal */}
      {showCopyModal && questionToCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Copy size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Copy Question to Another Exam
                </h3>
                <p className="text-xs text-slate-400">Reuse this question from the Question Bank</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 italic">
              "{questionToCopy.question}"
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destination Exam
              </label>
              <select
                value={copyTargetExamId}
                onChange={(e) => setCopyTargetExamId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} {ex.subject ? `(${ex.subject})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-primary-orange hover:bg-orange-600 text-white shadow-md shadow-orange-950/20 transition-all"
              >
                Copy Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {showDeleteModal && questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Confirm Delete Question
                </h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this question?
            </p>
            <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
              "{questionToDelete.question}"
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setQuestionToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-950/30 transition-all"
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
