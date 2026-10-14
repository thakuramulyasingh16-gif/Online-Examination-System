import React, { useState, useMemo, useRef } from 'react';
import api from '../../services/api';
import {
  Search,
  Plus,
  Upload,
  KeyRound,
  Trash2,
  Edit,
  User,
  Check,
  X,
  AlertTriangle,
  Copy,
  Download,
  ArrowUpDown,
  Filter,
  Camera,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config';
import { exportToCSV } from '../../utils/exportUtils';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

interface StudentItem {
  id: number;
  name: string;
  email: string | null;
  loginId: string;
  role: string;
  profileImage: string | null;
  isActive: boolean;
  createdAt: string;
}

interface StudentsTabProps {
  students: StudentItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  loading,
  onRefresh,
}) => {
  const { toast } = useToast();

  // Search, Filter, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetResult, setResetResult] = useState<{ studentName: string; loginId: string; newPassword: string } | null>(null);

  // Bulk Upload state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkParsedData, setBulkParsedData] = useState<any[]>([]);
  const [bulkFileName, setBulkFileName] = useState('');
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkSuccessModal, setBulkSuccessModal] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLoginId, setFormLoginId] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate credentials helper
  const handleAutoGenerateCredentials = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const newLoginId = `STU${new Date().getFullYear()}${num}`;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 7; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPassword = `${pwd}@1`;

    setFormLoginId(newLoginId);
    setFormPassword(newPassword);
    toast.info('Generated unique Login ID & secure password', 'Credentials Generated');
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormEmail('');
    setFormLoginId('');
    setFormPassword('');
    setFormIsActive(true);
    setFormImage(null);
    setImagePreview(null);
    setShowPassword(false);
    setShowAddEditModal(true);
  };

  const openEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormEmail(student.email || '');
    setFormLoginId(student.loginId);
    setFormPassword('');
    setFormIsActive(student.isActive !== false);
    setFormImage(null);
    setImagePreview(student.profileImage ? `${API_BASE_URL}${student.profileImage}` : null);
    setShowPassword(false);
    setShowAddEditModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Student Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', formName.trim());
      formData.append('email', formEmail.trim());
      formData.append('loginId', formLoginId.trim());
      if (formPassword.trim()) {
        formData.append('password', formPassword.trim());
      }
      formData.append('isActive', String(formIsActive));
      if (formImage) {
        formData.append('profileImage', formImage);
      }

      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
        toast.success('Student updated successfully');
      } else {
        const { data } = await api.post('/students', formData);
        toast.success(`Student created! Login ID: ${data.loginId}`);
      }

      setShowAddEditModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (student: StudentItem) => {
    try {
      await api.put(`/students/${student.id}/toggle-status`);
      toast.success(
        `Student "${student.name}" is now ${!student.isActive ? 'Active' : 'Inactive'}`
      );
      onRefresh();
    } catch {
      toast.error('Failed to update student status');
    }
  };

  // Reset Password
  const handleResetPassword = async (student: StudentItem) => {
    try {
      const { data } = await api.post(`/students/${student.id}/reset-password`);
      setResetResult({
        studentName: student.name,
        loginId: data.loginId,
        newPassword: data.newPassword,
      });
      setShowResetModal(true);
      toast.success('Password reset successfully');
    } catch {
      toast.error('Failed to reset password');
    }
  };

  // Delete Student
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await api.delete(`/students/${studentToDelete.id}`);
      toast.success(`Student "${studentToDelete.name}" deleted successfully`);
      setShowDeleteModal(false);
      setStudentToDelete(null);
      onRefresh();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  // Bulk CSV Upload Handlers
  const handleDownloadSampleCSV = () => {
    const sample = [
      { name: 'Rahul Sharma', email: 'rahul@example.com', loginId: 'STU2026101', password: 'Pass@2026' },
      { name: 'Priya Patel', email: 'priya@example.com', loginId: 'STU2026102', password: 'Pass@2026' },
      { name: 'Amit Verma', email: 'amit@example.com', loginId: '', password: '' },
    ];
    exportToCSV('sample_students_import', sample, [
      { key: 'name', label: 'name' },
      { key: 'email', label: 'email' },
      { key: 'loginId', label: 'loginId' },
      { key: 'password', label: 'password' },
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
        toast.error('CSV file has no data rows');
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
          name: rowObj.name || cols[0] || '',
          email: rowObj.email || cols[1] || '',
          loginId: rowObj.loginid || cols[2] || '',
          password: rowObj.password || cols[3] || '',
        });
      }

      setBulkParsedData(parsed);
      toast.info(`Parsed ${parsed.length} candidate rows from CSV`, 'CSV Loaded');
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkUpload = async () => {
    if (bulkParsedData.length === 0) return;
    setIsBulkUploading(true);
    try {
      const { data } = await api.post('/students/bulk', bulkParsedData);
      toast.success(data.message || `Imported ${data.createdCount} students`);
      setShowBulkModal(false);
      setBulkParsedData([]);
      setBulkFileName('');
      setBulkSuccessModal(data.createdStudents || []);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error executing bulk import');
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Filtered & Sorted Data
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((s) => s.isActive !== false);
    } else if (statusFilter === 'inactive') {
      result = result.filter((s) => s.isActive === false);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.loginId.toLowerCase().includes(term) ||
          (s.email && s.email.toLowerCase().includes(term))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [students, statusFilter, searchTerm, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, login ID, email..."
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

        {/* Filters and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'active', 'inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-primary-orange shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>

          {/* Bulk Upload CSV button */}
          <button
            onClick={() => {
              setBulkParsedData([]);
              setBulkFileName('');
              setShowBulkModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Upload size={15} />
            <span>Bulk CSV</span>
          </button>

          {/* Add Student button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-primary-orange hover:bg-orange-600 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* 2. Students Table with Sticky Header, Row Hover, Empty & Loading States */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] relative">
          <table className="w-full text-left border-collapse">
            {/* Sticky Header */}
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-4">Login ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-6 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-xl" /></td>
                  </tr>
                ))
              ) : paginatedStudents.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <EmptyState
                      title="No students found"
                      description={
                        searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your search criteria or status filter.'
                          : 'Get started by creating a new student account or importing via CSV.'
                      }
                      actionLabel={!searchTerm && statusFilter === 'all' ? '+ Add Student' : undefined}
                      onAction={openAddModal}
                    />
                  </td>
                </tr>
              ) : (
                // Render Student Rows
                paginatedStudents.map((student) => {
                  const isActive = student.isActive !== false;
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-orange-50/40 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      {/* Name & Photo */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/60 flex items-center justify-center overflow-hidden shrink-0">
                            {student.profileImage ? (
                              <img
                                src={`${API_BASE_URL}${student.profileImage}`}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-sm text-primary-orange">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {student.email || 'No email registered'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Login ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {student.loginId}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(student.loginId);
                              toast.info('Login ID copied to clipboard');
                            }}
                            className="text-slate-400 hover:text-primary-orange opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy Login ID"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Active / Inactive Toggle Switch */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={`Click to set ${isActive ? 'Inactive' : 'Active'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(student.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password Button */}
                          <button
                            onClick={() => handleResetPassword(student)}
                            className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all"
                            title="Reset Password"
                          >
                            <KeyRound size={16} />
                          </button>

                          {/* Edit Student Button */}
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-2 rounded-xl text-slate-500 hover:text-primary-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-all"
                            title="Edit Student"
                          >
                            <Edit size={16} />
                          </button>

                          {/* Delete Student Button */}
                          <button
                            onClick={() => {
                              setStudentToDelete(student);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                            title="Delete Student"
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>
            <span>to</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>
            <span>of</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {filteredStudents.length} students
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
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

      {/* 3. Add / Edit Student Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <User className="text-primary-orange" size={20} />
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Photo Upload with Preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={22} className="text-slate-400" />
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera size={18} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Student Profile Photo</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG or WEBP (Max 2MB)</p>
                  <label className="inline-block mt-1 text-xs font-bold text-primary-orange hover:underline cursor-pointer">
                    Browse Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                />
              </div>

              {/* Login ID with Auto-generate */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Login ID {editingStudent ? '' : '(Roll No / User ID)'}
                  </label>
                  {!editingStudent && (
                    <button
                      type="button"
                      onClick={handleAutoGenerateCredentials}
                      className="text-[11px] font-bold text-primary-orange hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={11} /> Auto-generate Credentials
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formLoginId}
                  onChange={(e) => setFormLoginId(e.target.value)}
                  placeholder="e.g. STU2026101"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {editingStudent ? 'New Password (Leave blank to keep unchanged)' : 'Initial Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingStudent ? '••••••••' : 'Enter or auto-generate password'}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Active Status Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Account Active</p>
                  <p className="text-[11px] text-slate-400">Allow student to log in and attempt exams</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-primary-orange hover:bg-orange-600 text-white shadow-md shadow-orange-950/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Bulk Upload CSV Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Upload className="text-primary-orange" size={20} />
                  Bulk Upload Students via CSV
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import multiple student accounts simultaneously
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Sample Template Download */}
              <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Download Sample CSV Template</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Columns: <code className="text-primary-orange font-bold">name, email, loginId, password</code>
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
                  {bulkFileName ? bulkFileName : 'Click to select CSV file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports standard .csv formatted files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCSVFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview Table of Parsed Rows */}
              {bulkParsedData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Parsed Preview ({bulkParsedData.length} records ready)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Validated</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-bold text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Login ID</th>
                          <th className="p-2.5">Password</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {bulkParsedData.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                            <td className="p-2.5 font-sans font-bold">{row.name}</td>
                            <td className="p-2.5 text-slate-500">{row.email || '-'}</td>
                            <td className="p-2.5">{row.loginId || '<Auto-generate>'}</td>
                            <td className="p-2.5 text-slate-400">{row.password ? '••••••••' : '<Auto-generate>'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {bulkParsedData.length > 10 && (
                    <p className="text-[11px] text-slate-400 text-center">
                      Showing first 10 of {bulkParsedData.length} entries...
                    </p>
                  )}
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
                disabled={bulkParsedData.length === 0 || isBulkUploading}
                onClick={handleExecuteBulkUpload}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-primary-orange hover:bg-orange-600 text-white shadow-md shadow-orange-950/20 active:scale-95 disabled:opacity-40 transition-all"
              >
                {isBulkUploading ? 'Importing...' : `Import ${bulkParsedData.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bulk Upload Success Modal with Credentials Export */}
      {bulkSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check size={26} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Bulk Import Successful!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {bulkSuccessModal.length} student accounts have been created with login credentials.
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50 dark:bg-slate-850 space-y-2 text-xs font-mono">
              {bulkSuccessModal.map((s, i) => (
                <div key={i} className="flex justify-between items-center pb-1.5 border-b border-slate-200/60 dark:border-slate-800 last:border-none">
                  <div>
                    <span className="font-sans font-bold text-slate-800 dark:text-white">{s.name}</span>
                    <span className="text-slate-400 text-[10px] block">ID: {s.loginId}</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{s.generatedPassword}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  exportToCSV('imported_students_credentials', bulkSuccessModal, [
                    { key: 'name', label: 'Name' },
                    { key: 'loginId', label: 'Login ID' },
                    { key: 'generatedPassword', label: 'Password' },
                    { key: 'email', label: 'Email' },
                  ]);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                <Download size={14} /> Download Credentials CSV
              </button>
              <button
                onClick={() => setBulkSuccessModal(null)}
                className="px-5 py-2.5 rounded-xl bg-primary-orange text-white font-bold text-xs hover:bg-orange-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Reset Password Result Modal */}
      {showResetModal && resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Password Reset Successfully
                </h3>
                <p className="text-xs text-slate-400">Share these new login credentials with the student</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate</span>
                <span className="text-sm font-black text-slate-800 dark:text-white">{resetResult.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Login ID</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{resetResult.loginId}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">New Temporary Password</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono text-sm font-black text-primary-orange tracking-wider">{resetResult.newPassword}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetResult.newPassword);
                      toast.info('Password copied to clipboard');
                    }}
                    className="p-1.5 text-slate-400 hover:text-primary-orange rounded-lg"
                    title="Copy Password"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowResetModal(false);
                setResetResult(null);
              }}
              className="w-full py-2.5 rounded-xl bg-primary-orange text-white font-bold text-xs hover:bg-orange-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Confirm Student Deletion
                </h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete candidate{' '}
              <strong className="text-slate-900 dark:text-white">"{studentToDelete.name}"</strong> (Login ID:{' '}
              <code className="text-primary-orange font-bold">{studentToDelete.loginId}</code>)? All exam attempts, results, and proctoring logs associated with this student will also be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
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
                Yes, Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
