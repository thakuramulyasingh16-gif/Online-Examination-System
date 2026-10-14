import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams');
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-primary-orange to-amber-500 rounded-3xl p-8 text-white shadow-elevated flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-6 z-10">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md overflow-hidden border-2 border-white/50 shadow-lg shrink-0">
            {user?.profileImage ? (
              <img
                src={`${API_BASE_URL}${user.profileImage}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white">
                {user?.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-2">
              <ShieldCheck size={14} /> Verified Student
            </div>
            <h1 className="text-3xl font-black tracking-tight">Welcome, {user?.name}!</h1>
            <p className="text-orange-100 font-medium text-sm mt-0.5">Student ID: {user?.loginId}</p>
            <p className="text-orange-100/80 text-xs mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-4 z-10">
          <Link
            to="/results"
            className="bg-white text-primary-orange px-6 py-3 rounded-2xl font-bold hover:bg-orange-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
          >
            <Award size={18} /> My Academic Records
          </Link>
        </div>
      </div>

      {/* Available Examinations Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="text-primary-orange" /> Available Examinations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select an examination below to start your assessment session.
            </p>
          </div>
          <Badge variant="primary" size="md">
            {exams.length} Total Exams
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card
                key={exam.id}
                hoverable
                className="overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-50 dark:bg-orange-950/40 p-3 rounded-2xl text-primary-orange border border-orange-100 dark:border-orange-900/40">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    {exam.Results && exam.Results.length > 0 ? (
                      <Badge variant="success" size="sm" dot>
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="primary" size="sm" dot>
                        Available
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-orange transition-colors">
                    {exam.title}
                  </h3>

                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs mb-6">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={15} /> {exam.duration} Minutes
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Award size={15} /> MCQ Based
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {exam.Results && exam.Results.length > 0 ? (
                    <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={18} /> Completed
                    </div>
                  ) : (
                    <Link
                      to={`/exam/${exam.id}`}
                      className="w-full bg-primary-orange text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-md group-hover:shadow-lg"
                    >
                      Start Examination <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </Card>
            ))}

            {exams.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No Examinations Assigned"
                  description="There are currently no active tests assigned to your student profile. Please check back later or consult your faculty."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
