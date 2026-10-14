import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Book, Search, Filter } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

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

  const filteredResults = results.filter((result) => {
    const studentName = result.User?.name?.toLowerCase() || '';
    const examTitle = result.Exam?.title?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return studentName.includes(search) || examTitle.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold text-primary-orange animate-pulse text-xl">
        Fetching Examination Records...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Examination Results
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
            {user?.role === 'admin'
              ? 'Detailed student performance overview and misconduct tracking'
              : 'Your personal academic assessment history'}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/40 p-3.5 rounded-2xl border border-orange-200/60 dark:border-orange-800/40 text-primary-orange">
          <BarChart className="w-7 h-7" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-3 sm:p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name or exam title..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-orange outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
          <Filter size={16} /> Filter
        </button>
      </Card>

      {/* Results Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                {user?.role === 'admin' && (
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Student
                  </th>
                )}
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Examination
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Score
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Percentage
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Submission
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-orange-50/30 dark:hover:bg-slate-800/40 transition-colors group">
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold group-hover:bg-primary-orange group-hover:text-white transition-colors">
                          {result.User?.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{result.User?.name}</div>
                          <div className="text-[11px] text-slate-400">{result.User?.email}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-orange-50 dark:bg-orange-950/40 p-2 rounded-lg text-primary-orange">
                        <Book size={16} />
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{result.Exam?.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {result.score} MARKS
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-lg text-slate-900 dark:text-white tracking-tight">
                    {result.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4">
                    {result.percentage >= 40 ? (
                      <Badge variant="success" size="sm" dot>
                        Passed
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm" dot>
                        Failed
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {result.status === 'terminated' ? (
                      <Badge variant="danger" size="sm">
                        TERMINATED
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        {result.status}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="p-8">
            <EmptyState
              title="No Results Found"
              description="No examination performance records match your search query."
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResultPage;
