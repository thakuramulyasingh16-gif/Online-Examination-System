import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Clock, FileText } from 'lucide-react';

const CreateExam = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/exams', { title, duration: parseInt(duration) });
      navigate(`/admin/exam/${data.id}/questions`);
    } catch (error) {
      alert('Error creating exam');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create New Exam</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
               <FileText size={18} className="text-primary-orange" /> Exam Title
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-orange outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final Mathematics Assessment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
               <Clock size={18} className="text-secondary-yellow" /> Duration (Minutes)
            </label>
            <input
              type="number"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-orange outline-none transition-all"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-primary-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-md transform hover:-translate-y-1"
            >
              Next: Add Questions
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
               You'll be redirected to the question management page after creation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
