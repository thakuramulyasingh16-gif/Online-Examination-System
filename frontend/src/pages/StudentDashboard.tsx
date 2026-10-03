import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Clock, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data } = await api.get('/exams');
    setExams(data);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-primary-orange to-orange-400 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md overflow-hidden border-2 border-white/50 shadow-lg">
            {user?.profileImage ? (
              <img src={`${import.meta.env.VITE_API_BASE_URL ?? ''}${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                {user?.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-orange-50 font-medium">Student ID: {user?.loginId}</p>
            <p className="text-orange-100 text-sm mt-1">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/results" className="bg-white text-primary-orange px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-md flex items-center gap-2">
            <Award size={20} /> My Results
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-primary-orange" /> Available Examinations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
               <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div className="bg-orange-50 p-3 rounded-xl">
                        <BookOpen className="text-primary-orange" />
                     </div>
                     <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">ACTIVE</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-orange transition-colors">{exam.title}</h3>
                  <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                     <div className="flex items-center gap-1">
                        <Clock size={16} /> {exam.duration} Minutes
                     </div>
                     <div className="flex items-center gap-1">
                        <Award size={16} /> MCQ Based
                     </div>
                  </div>
                  {exam.Results && exam.Results.length > 0 ? (
                    <div className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-green-200">
                      Completed <Award size={18} />
                    </div>
                  ) : (
                    <Link 
                      to={`/exam/${exam.id}`}
                      className="w-full bg-primary-orange text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-md"
                    >
                      Start Examination <ArrowRight size={18} />
                    </Link>
                  )}
               </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <p className="text-gray-400 font-medium italic">No exams are currently assigned to you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
