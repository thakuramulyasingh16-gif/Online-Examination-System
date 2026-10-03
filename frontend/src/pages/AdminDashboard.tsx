import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Users, BookOpen, BarChart2, Plus, Trash2, Edit, Camera, Settings, Lock, Monitor } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
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
      setShowStudentModal(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', loginId: '', password: '' });
      setProfileImage(null);
      fetchStudents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving student');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profileFormData);
      alert('Profile updated successfully! Please login again if you changed credentials.');
      setShowProfileModal(false);
      window.location.reload(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const deleteStudent = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/students/${id}`);
      fetchStudents();
    }
  };

  const deleteExam = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/exams/${id}`);
      fetchExams();
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchExams();

    // Initialize Socket for Monitoring
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || window.location.origin);
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your system students and examinations</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors shadow-md"
          >
            <Settings size={20} /> Security Settings
          </button>
          <button
            onClick={() => { setShowStudentModal(true); setEditingStudent(null); }}
            className="flex items-center gap-2 bg-primary-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-md"
          >
            <Plus size={20} /> Add Student
          </button>
          <Link
            to="/admin/create-exam"
            className="flex items-center gap-2 bg-secondary-yellow text-gray-800 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors shadow-md font-semibold"
          >
            <Plus size={20} /> Create Exam
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary-orange flex items-center gap-4">
          <div className="bg-primary-orange/10 p-4 rounded-full">
            <Users className="text-primary-orange w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="text-2xl font-bold">{students.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-secondary-yellow flex items-center gap-4">
          <div className="bg-secondary-yellow/10 p-4 rounded-full">
            <BookOpen className="text-yellow-600 w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Exams</p>
            <p className="text-2xl font-bold">{exams.length}</p>
          </div>
        </div>
        <Link to="/results" className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-4 rounded-full">
            <BarChart2 className="text-green-600 w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">View All Results</p>
            <p className="text-lg font-bold">Performance Analytics</p>
          </div>
        </Link>
        <Link to="/admin/proctoring" className="bg-gray-900 p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center gap-4 hover:shadow-xl transition-all group">
          <div className="bg-red-500/10 p-4 rounded-full group-hover:bg-red-500/20 transition-colors">
            <Monitor className="text-red-500 w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Live Proctoring</p>
            <p className="text-lg font-bold text-white uppercase italic tracking-tighter">Command Center</p>
          </div>
        </Link>
      </div>

      {/* Live Monitoring Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Monitor size={22} className="text-red-500 animate-pulse" /> Live Student Monitoring
          </h2>
          <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full uppercase tracking-wider">
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} /> Manage Students
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Login ID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                          {student.profileImage ? (
                            <img src={`${import.meta.env.VITE_API_BASE_URL ?? ''}${student.profileImage}`} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-primary-orange">{student.loginId}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setFormData({ name: student.name, email: student.email, loginId: student.loginId, password: '' });
                            setShowStudentModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} /> Manage Exams
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{exam.title}</td>
                    <td className="px-6 py-4 text-gray-600">{exam.duration} mins</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/exam/${exam.id}/questions`}
                          className="p-2 text-primary-orange hover:bg-orange-50 rounded-lg transition-colors"
                          title="Manage Questions"
                        >
                          <Plus size={18} />
                        </Link>
                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none font-mono text-primary-orange"
                  value={formData.loginId}
                  onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingStudent && <span className="text-xs text-gray-400">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!editingStudent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-3 rounded-lg hover:border-primary-orange cursor-pointer transition-colors">
                    <Camera size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Choose file</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                      accept="image/*"
                    />
                  </label>
                  {profileImage && <div className="text-xs text-green-600 font-semibold truncate max-w-[100px]">{profileImage.name}</div>}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  {editingStudent ? 'Update' : 'Create'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-800">
                    <Lock size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Admin Security</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Display Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  value={profileFormData.name}
                  onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Login ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none font-mono"
                  value={profileFormData.loginId}
                  onChange={(e) => setProfileFormData({ ...profileFormData, loginId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-xs text-gray-400">(Leave blank to keep current)</span></label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  value={profileFormData.password}
                  onChange={(e) => setProfileFormData({ ...profileFormData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="text-xs text-yellow-700">Changing your Login ID or Password will require a session refresh. For security, you will be automatically re-authenticated.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors font-semibold"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
