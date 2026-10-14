import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Users, BookOpen, BarChart2, Plus, Trash2, Edit, Camera, Settings, Lock, Monitor } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';
import { Modal, Button, Input } from '../components/ui';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [monitoringFeeds, setMonitoringFeeds] = useState<{[key: string]: any}>({});
  const socketRef = useRef<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    loginId: '',
    password: '',
  });
  const [profileFormData, setProfileFormData] = useState({
    name: user?.name || '',
    loginId: user?.loginId || '',
    password: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const fetchStudents = async () => {
    const { data } = await api.get('/students');
    setStudents(data);
  };

  const fetchExams = async () => {
    const { data } = await api.get('/exams');
    setExams(data);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('loginId', formData.loginId);
    if (formData.password) data.append('password', formData.password);
    if (profileImage) data.append('profileImage', profileImage);

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, data);
      } else {
        await api.post('/students', data);
      }
      toast.success(editingStudent ? 'Student record updated' : 'New student created successfully');
      setShowStudentModal(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', loginId: '', password: '' });
      setProfileImage(null);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving student');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profileFormData);
      toast.success('Profile updated successfully!');
      setShowProfileModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  const deleteStudent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student removed successfully');
        fetchStudents();
      } catch {
        toast.error('Failed to delete student');
      }
    }
  };

  const deleteExam = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/exams/${id}`);
        toast.success('Exam removed successfully');
        fetchExams();
      } catch {
        toast.error('Failed to delete exam');
      }
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchExams();

    // Initialize Socket for Monitoring
    socketRef.current = io(API_BASE_URL);
    socketRef.current.emit('join-room', 'admin-monitoring');

    socketRef.current.on('admin-receive-frame', (data: any) => {
      setMonitoringFeeds(prev => ({
        ...prev,
        [data.studentId]: {
          studentName: data.studentName,
          frame: data.frame,
          lastSeen: new Date()
        }
      }));
    });

    socketRef.current.on('student-disconnected', (studentId: string) => {
      setMonitoringFeeds(prev => {
        const newFeeds = { ...prev };
        delete newFeeds[studentId];
        return newFeeds;
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage system students, proctoring feeds, and examinations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl hover:bg-black transition-all shadow-sm font-semibold text-sm"
          >
            <Settings size={18} /> Security Settings
          </button>
          <button
            onClick={() => { setShowStudentModal(true); setEditingStudent(null); }}
            className="flex items-center gap-2 bg-primary-orange text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-sm font-semibold text-sm"
          >
            <Plus size={18} /> Add Student
          </button>
          <Link
            to="/admin/create-exam"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm font-semibold text-sm"
          >
            <Plus size={18} /> Create Exam
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-primary-orange flex items-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-950/40 p-3.5 rounded-2xl text-primary-orange">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{students.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-amber-500 flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl text-amber-600 dark:text-amber-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Exams</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{exams.length}</p>
          </div>
        </div>

        <Link to="/results" className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-emerald-500 flex items-center gap-4 hover:shadow-elevated hover:-translate-y-0.5 transition-all group">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">View All Results</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-primary-orange transition-colors">Analytics &amp; Scores</p>
          </div>
        </Link>

        <Link to="/admin/proctoring" className="bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-card border border-slate-800 border-l-4 border-l-rose-500 flex items-center gap-4 hover:shadow-elevated hover:-translate-y-0.5 transition-all group">
          <div className="bg-rose-500/10 p-3.5 rounded-2xl text-rose-500 group-hover:bg-rose-500/20 transition-colors">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">AI Surveillance</p>
            <p className="text-base font-black text-white italic tracking-tight">Proctor Command</p>
          </div>
        </Link>
      </div>

      {/* Live Monitoring Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor size={20} className="text-rose-500 animate-pulse" /> Live Student Monitoring
          </h2>
          <span className="text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full uppercase tracking-wider border border-rose-200/60 dark:border-rose-900/40">
            {Object.keys(monitoringFeeds).length} Students Online
          </span>
        </div>
        <div className="p-6">
          {Object.keys(monitoringFeeds).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Camera size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-lg">No active exam sessions found</p>
              <p className="text-sm">Student camera feeds will appear here automatically when they start an exam.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(monitoringFeeds).map(([studentId, data]: [string, any]) => (
                <div key={studentId} className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border-2 border-gray-800 relative group">
                  <img 
                    src={data.frame} 
                    alt={data.studentName} 
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white font-bold text-sm truncate">{data.studentName}</p>
                    <p className="text-[10px] text-gray-300">Last updated: {data.lastSeen.toLocaleTimeString()}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-white font-bold bg-black/50 px-1 rounded uppercase">Live</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-primary-orange" /> Manage Students
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Login ID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                          {student.profileImage ? (
                            <img src={`${API_BASE_URL}${student.profileImage}`} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary-orange font-bold">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-primary-orange">{student.loginId}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setFormData({ name: student.name, email: student.email, loginId: student.loginId, password: '' });
                            setShowStudentModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                          title="Edit Student"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exams List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-amber-500" /> Manage Exams
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{exam.title}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">{exam.duration} mins</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/exam/${exam.id}/questions`}
                          className="p-2 text-primary-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition-colors"
                          title="Manage Questions"
                        >
                          <Plus size={16} />
                        </Link>
                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="Delete Exam"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        description="Provide student details and optional biometric face reference."
        maxWidth="md"
      >
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
          <Input
            label="Login ID"
            type="text"
            required
            value={formData.loginId}
            onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
            placeholder="STU-001"
            className="font-mono text-primary-orange"
          />
          <Input
            label={`Password ${editingStudent ? '(Leave blank to keep current)' : ''}`}
            type="password"
            required={!editingStudent}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Profile Image</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 p-3 rounded-xl hover:border-primary-orange cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50">
                <Camera size={20} className="text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Choose file</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </label>
              {profileImage && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[120px]">{profileImage.name}</div>}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowStudentModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              {editingStudent ? 'Update' : 'Create'} Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admin Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title={
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-primary-orange" />
            <span>Admin Security</span>
          </div>
        }
        description="Update your administrative credentials."
        maxWidth="md"
      >
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input
            label="Admin Display Name"
            type="text"
            required
            value={profileFormData.name}
            onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
          />
          <Input
            label="Admin Login ID"
            type="text"
            required
            value={profileFormData.loginId}
            onChange={(e) => setProfileFormData({ ...profileFormData, loginId: e.target.value })}
            className="font-mono"
          />
          <Input
            label="New Password (Leave blank to keep current)"
            type="password"
            value={profileFormData.password}
            onChange={(e) => setProfileFormData({ ...profileFormData, password: e.target.value })}
            placeholder="••••••••"
          />
          <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 rounded-r-xl">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Changing your Login ID or Password will require a session refresh. For security, you will be automatically re-authenticated.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowProfileModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="flex-1"
            >
              Update Credentials
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
