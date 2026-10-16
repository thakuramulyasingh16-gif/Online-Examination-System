import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Shuffle,
  HelpCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { AdminTab } from './AdminSidebar';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export interface ExamItem {
  id: number;
  title: string;
  duration: number;
  subject?: string | null;
  totalMarks?: number;
  passMarks?: number;
  negativeMarking?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  isPublished?: boolean;
  scheduledAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  Questions?: any[];
  Results?: any[];
}

interface ExamsTabProps {
  exams: ExamItem[];
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab: (tab: AdminTab, params?: any) => void;
  onSelectExamForQuestions?: (examId: number) => void;
}

export const ExamsTab: React.FC<ExamsTabProps> = ({
  exams,
  loading,
  onRefresh,
  onNavigateTab,
  onSelectExamForQuestions,
}) => {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'scheduled' | 'draft'>('all');

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formTotalMarks, setFormTotalMarks] = useState('100');
  const [formPassMarks, setFormPassMarks] = useState('40');
  const [formNegativeMarking, setFormNegativeMarking] = useState('0');
  const [formShuffleQuestions, setFormShuffleQuestions] = useState(false);
  const [formShuffleOptions, setFormShuffleOptions] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formEndAt, setFormEndAt] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState<ExamItem | null>(null);

  // Helpers to format ISO to datetime-local string
  const toDateTimeLocal = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setEditingExam(null);
    setFormTitle('');
    setFormSubject('');
    setFormDuration('60');
    setFormTotalMarks('100');
    setFormPassMarks('40');
    setFormNegativeMarking('0');
    setFormShuffleQuestions(false);
    setFormShuffleOptions(false);
    setFormIsPublished(true);
    setFormScheduledAt('');
    setFormEndAt('');
    setShowModal(true);
  };

  const openEditModal = (exam: ExamItem) => {
    setEditingExam(exam);
    setFormTitle(exam.title);
    setFormSubject(exam.subject || '');
    setFormDuration(String(exam.duration || 60));
    setFormTotalMarks(String(exam.totalMarks || 100));
    setFormPassMarks(String(exam.passMarks || 40));
    setFormNegativeMarking(String(exam.negativeMarking || 0));
    setFormShuffleQuestions(!!exam.shuffleQuestions);
    setFormShuffleOptions(!!exam.shuffleOptions);
    setFormIsPublished(exam.isPublished !== false);
    setFormScheduledAt(toDateTimeLocal(exam.scheduledAt));
    setFormEndAt(toDateTimeLocal(exam.endAt));
    setShowModal(true);
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Exam Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        subject: formSubject.trim() || null,
        duration: parseInt(formDuration) || 60,
        totalMarks: parseInt(formTotalMarks) || 100,
        passMarks: parseInt(formPassMarks) || 40,
        negativeMarking: parseFloat(formNegativeMarking) || 0,
        shuffleQuestions: formShuffleQuestions,
        shuffleOptions: formShuffleOptions,
        isPublished: formIsPublished,
        scheduledAt: formScheduledAt ? new Date(formScheduledAt).toISOString() : null,
        endAt: formEndAt ? new Date(formEndAt).toISOString() : null,
      };

      if (editingExam) {
        await api.put(`/exams/${editingExam.id}`, payload);
        toast.success('Exam configurations updated successfully');
      } else {
        const { data } = await api.post('/exams', payload);
        toast.success('Exam created successfully! You can now add questions.');
        if (onSelectExamForQuestions) {
          onSelectExamForQuestions(data.id);
        }
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (exam: ExamItem) => {
    try {
      await api.put(`/exams/${exam.id}/toggle-publish`);
      toast.success(`Exam "${exam.title}" is now ${!exam.isPublished ? 'Published' : 'Unpublished (Draft)'}`);
      onRefresh();
    } catch {
      toast.error('Failed to update publish state');
    }
  };

  // Duplicate Exam
  const handleDuplicateExam = async (exam: ExamItem) => {
    try {
      await api.post(`/exams/${exam.id}/duplicate`);
      toast.success(`Exam "${exam.title}" duplicated with all questions!`);
      onRefresh();
    } catch {
      toast.error('Failed to duplicate exam');
    }
  };

  // Delete Exam
  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    try {
      await api.delete(`/exams/${examToDelete.id}`);
      toast.success(`Exam "${examToDelete.title}" deleted successfully`);
      setShowDeleteModal(false);
      setExamToDelete(null);
      onRefresh();
    } catch {
      toast.error('Failed to delete exam');
    }
  };

  // Check Live Status
  const getExamTimingStatus = (exam: ExamItem) => {
    if (!exam.isPublished) return { label: 'Draft', color: 'slate' };
    const now = new Date();
    const start = exam.scheduledAt ? new Date(exam.scheduledAt) : null;
    const end = exam.endAt ? new Date(exam.endAt) : null;

    if (!start && !end) return { label: 'Always Active', color: 'emerald' };
    if (start && now < start) return { label: 'Scheduled', color: 'blue' };
    if (end && now > end) return { label: 'Ended', color: 'slate' };
    return { label: 'Live Now', color: 'rose' };
  };

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Search
      const matchSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.subject && exam.subject.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      // Status filter
      if (filterStatus === 'all') return true;
      const timing = getExamTimingStatus(exam);
      if (filterStatus === 'live') return timing.label === 'Live Now' || timing.label === 'Always Active';
      if (filterStatus === 'scheduled') return timing.label === 'Scheduled';
      if (filterStatus === 'draft') return !exam.isPublished;
      return true;
    });
  }, [exams, searchTerm, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exams by title or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Badges & Create Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'live', 'scheduled', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-white dark:bg-slate-700 text-primary-orange shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-primary-orange hover:bg-orange-600 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus size={16} />
            <span>Create Exam</span>
          </button>
        </div>
      </div>

      {/* 2. Exams Table with Sticky Header & Row Hover */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">Exam Title &amp; Subject</th>
                <th className="py-3.5 px-4">Schedule Window</th>
                <th className="py-3.5 px-4">Duration &amp; Marks</th>
                <th className="py-3.5 px-4">Questions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="py-4 px-6 text-right"><Skeleton className="h-8 w-28 ml-auto rounded-xl" /></td>
                  </tr>
                ))
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <EmptyState
                      title="No exams found"
                      description={
                        searchTerm || filterStatus !== 'all'
                          ? 'No examinations matched your filter settings.'
                          : 'Get started by creating your first online assessment.'
                      }
                      actionLabel={!searchTerm && filterStatus === 'all' ? '+ Create Exam' : undefined}
                      onAction={openCreateModal}
                    />
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => {
                  const timing = getExamTimingStatus(exam);
                  const isPublished = exam.isPublished !== false;
                  const questionCount = exam.Questions?.length || 0;

                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-orange-50/40 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      {/* Title & Subject */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-primary-orange shrink-0 mt-0.5">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-orange transition-colors">
                              {exam.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {exam.subject && (
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {exam.subject}
                                </span>
                              )}
                              {exam.shuffleQuestions && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5" title="Questions shuffled per candidate">
                                  <Shuffle size={10} /> Q-Shuffle
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Schedule Window */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        {exam.scheduledAt || exam.endAt ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                              <Calendar size={13} className="text-primary-orange shrink-0" />
                              <span>{exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Anytime'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 pl-4">
                              Until {exam.endAt ? new Date(exam.endAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Flexible Schedule</span>
                        )}
                      </td>

                      {/* Duration & Marks */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs space-y-1">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold">
                          <Clock size={13} className="text-amber-500" />
                          <span>{exam.duration} Minutes</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>Total: <strong>{exam.totalMarks || 100}</strong></span>
                          <span>•</span>
                          <span>Pass: <strong>{exam.passMarks || 40}</strong></span>
                          {(exam.negativeMarking || 0) > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-rose-500 font-bold">-{exam.negativeMarking} Neg</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Questions Count */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (onSelectExamForQuestions) {
                              onSelectExamForQuestions(exam.id);
                            }
                            onNavigateTab('questions', { examId: exam.id });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-orange-100 dark:bg-slate-800 dark:hover:bg-orange-950/50 text-slate-700 dark:text-slate-300 hover:text-primary-orange transition-colors text-xs font-bold"
                          title="Manage Questions for this exam"
                        >
                          <HelpCircle size={14} />
                          <span>{questionCount} Questions</span>
                        </button>
                      </td>

                      {/* Status / Publish Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePublish(exam)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isPublished ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            title={`Click to ${isPublished ? 'Unpublish' : 'Publish'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isPublished ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              timing.color === 'rose'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                                : timing.color === 'emerald'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : timing.color === 'blue'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {timing.label}
                          </span>
                        </div>
                      </td>

                      {/* Actions: Duplicate, Edit, Delete */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Duplicate Exam Button */}
                          <button
                            onClick={() => handleDuplicateExam(exam)}
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"
                            title="Duplicate Exam & Questions"
                          >
                            <Copy size={16} />
                          </button>

                          {/* Edit Exam Button */}
                          <button
                            onClick={() => openEditModal(exam)}
                            className="p-2 rounded-xl text-slate-500 hover:text-primary-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-all"
                            title="Edit Exam Settings"
                          >
                            <Edit size={16} />
                          </button>

                          {/* Delete Exam Button */}
                          <button
                            onClick={() => {
                              setExamToDelete(exam);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                            title="Delete Exam"
                          >
                            <Trash2 size={16} />
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
      </div>

      {/* 3. Create / Edit Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <BookOpen className="text-primary-orange" size={20} />
                {editingExam ? 'Edit Assessment Settings' : 'Create New Examination'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitExam} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Title & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Midterm Physics Examination"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Department
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Applied Sciences / Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>
              </div>

              {/* Duration & Negative Marking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="60"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pass Marks (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formPassMarks}
                    onChange={(e) => setFormPassMarks(e.target.value)}
                    placeholder="40"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>
              </div>

              {/* Schedule Start and End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Start Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formScheduledAt}
                    onChange={(e) => setFormScheduledAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled End Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formEndAt}
                    onChange={(e) => setFormEndAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                </div>
              </div>

              {/* Negative Marking Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Negative Marking Penalty (Per incorrect response)
                </label>
                <select
                  value={formNegativeMarking}
                  onChange={(e) => setFormNegativeMarking(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                >
                  <option value="0">None (0 Penalty)</option>
                  <option value="0.25">0.25 Marks (-25%)</option>
                  <option value="0.33">0.33 Marks (-33%)</option>
                  <option value="0.5">0.50 Marks (-50%)</option>
                  <option value="1">1.00 Mark (-100%)</option>
                </select>
              </div>

              {/* Toggles: Shuffle Questions, Shuffle Options, Publish Immediately */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Shuffle Questions</p>
                    <p className="text-[11px] text-slate-400">Randomize question sequence for each candidate</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormShuffleQuestions(!formShuffleQuestions)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formShuffleQuestions ? 'bg-primary-orange' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${formShuffleQuestions ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Shuffle Answer Options</p>
                    <p className="text-[11px] text-slate-400">Randomize choice order (A, B, C, D) per question</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormShuffleOptions(!formShuffleOptions)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formShuffleOptions ? 'bg-primary-orange' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${formShuffleOptions ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Publish Immediately</p>
                    <p className="text-[11px] text-slate-400">Make this exam visible to registered students</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsPublished(!formIsPublished)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formIsPublished ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${formIsPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  {isSubmitting ? 'Saving...' : editingExam ? 'Save Changes' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Exam Confirmation Modal */}
      {showDeleteModal && examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Confirm Exam Deletion
                </h3>
                <p className="text-xs text-slate-400">Permanently delete assessment</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{examToDelete.title}"</strong>? All associated questions, student submissions, and results will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setExamToDelete(null);
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
                Yes, Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
