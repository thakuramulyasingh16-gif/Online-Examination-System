import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle, BarChart, User, Book, Search, Filter } from 'lucide-react';

const ResultPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/results/all' : '/results/user';
      const { data } = await api.get(endpoint);
      setResults(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = results.filter(result => {
    const studentName = result.User?.name?.toLowerCase() || '';
    const examTitle = result.Exam?.title?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return studentName.includes(search) || examTitle.includes(search);
  });

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold text-primary-orange animate-pulse text-2xl">Fetching Performance Data...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Examination Results</h1>
          <p className="text-gray-500 font-medium">{user?.role === 'admin' ? 'Detailed student performance overview and misconduct tracking' : 'Your personal academic records'}</p>
        </div>
        <div className="bg-primary-orange/10 p-4 rounded-3xl border border-primary-orange/20">
           <BarChart className="text-primary-orange w-8 h-8" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by student name or exam title..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary-orange font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200">
           <Filter size={20} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                {user?.role === 'admin' && <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>}
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Examination</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Percentage</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-orange-50/30 transition-all group">
                  {user?.role === 'admin' && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black italic group-hover:bg-primary-orange group-hover:text-white transition-colors">
                            {result.User?.name?.charAt(0)}
                         </div>
                         <div>
                            <div className="font-black text-gray-900 italic uppercase tracking-tighter">{result.User?.name}</div>
                            <div className="text-[10px] font-bold text-gray-400">{result.User?.email}</div>
                         </div>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="bg-orange-100 p-2.5 rounded-xl text-primary-orange">
                          <Book size={18} />
                       </div>
                       <div className="font-bold text-gray-700 uppercase text-xs tracking-wider">{result.Exam?.title}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-black text-xs">
                       {result.score} MARKS
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-2xl text-gray-900 italic tracking-tighter">
                    {result.percentage.toFixed(1)}%
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 font-black text-xs tracking-widest uppercase ${result.percentage >= 40 ? 'text-green-600' : 'text-red-500'}`}>
                       {result.percentage >= 40 ? (
                         <>
                          <CheckCircle size={18} className="fill-green-100" /> <span>Passed</span>
                         </>
                       ) : (
                         <>
                          <Award className="rotate-180 fill-red-100" size={18} /> <span>Failed</span>
                         </>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${result.status === 'terminated' ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'}`}>
                        {result.status}
                     </span>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                       <Search size={64} className="mb-4 opacity-20" />
                       <p className="font-black uppercase tracking-[0.2em] text-sm">No results match your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
