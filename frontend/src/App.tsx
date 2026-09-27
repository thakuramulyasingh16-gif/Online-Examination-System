import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import CreateExam from './pages/CreateExam';
import ManageQuestions from './pages/ManageQuestions';
import ProctoringDashboard from './pages/ProctoringDashboard';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
        </ProtectedRoute>
      } />
      <Route path="/exam/:id" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      <Route path="/admin/create-exam" element={<ProtectedRoute adminOnly><CreateExam /></ProtectedRoute>} />
      <Route path="/admin/exam/:id/questions" element={<ProtectedRoute adminOnly><ManageQuestions /></ProtectedRoute>} />
      <Route path="/admin/proctoring" element={<ProtectedRoute adminOnly><ProctoringDashboard /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
