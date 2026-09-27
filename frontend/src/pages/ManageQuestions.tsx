import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, ArrowLeft, HelpCircle } from 'lucide-react';

const ManageQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [tempQuestions, setTempQuestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    marks: '1',
  });

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    const { data } = await api.get(`/questions/exam/${id}`);
    setQuestions(data);
  };

  const handleAddTemp = (e: React.FormEvent) => {
    e.preventDefault();
    setTempQuestions([...tempQuestions, { ...formData, examId: parseInt(id!) }]);
    setFormData({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: '',
      marks: '1',
    });
  };

  const handleBulkSubmit = async () => {
    if (tempQuestions.length === 0) return;
    try {
      await api.post('/questions/bulk', tempQuestions);
      setTempQuestions([]);
      fetchQuestions();
      alert('All questions added successfully!');
    } catch (error) {
      alert('Error adding questions');
    }
  };

  const deleteQuestion = async (qId: number) => {
    if (window.confirm('Delete this question?')) {
      await api.delete(`/questions/${qId}`);
      fetchQuestions();
    }
  };

  const removeTempQuestion = (index: number) => {
    setTempQuestions(tempQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Manage Questions</h1>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
        >
          Finish
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-primary-orange" /> Add New MCQ Question
        </h2>
        <form onSubmit={handleAddTemp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none h-24"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter your question here..."
                />
             </div>
             <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Marks</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none font-bold text-lg h-24 text-center"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                />
                <p className="text-[10px] text-gray-400 mt-1 text-center uppercase font-bold">Points / Marks</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option 1</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none"
                value={formData.option1}
                onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option 2</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none"
                value={formData.option2}
                onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option 3</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none"
                value={formData.option3}
                onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option 4</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none"
                value={formData.option4}
                onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-primary-orange font-bold">Correct Answer</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange outline-none bg-orange-50"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            >
              <option value="">Select Correct Option</option>
              <option value={formData.option1}>Option 1</option>
              <option value={formData.option2}>Option 2</option>
              <option value={formData.option3}>Option 3</option>
              <option value={formData.option4}>Option 4</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Make sure to fill all options before selecting the correct answer.</p>
          </div>
          <button
            type="submit"
            className="w-full bg-primary-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-md"
          >
            Add Question to Exam
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="text-secondary-yellow" /> Question Bank ({questions.length + tempQuestions.length})
          </h2>
          {tempQuestions.length > 0 && (
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              {tempQuestions.length} unsaved questions
            </span>
          )}
        </div>

        {/* Temporary Questions */}
        {tempQuestions.map((q, index) => (
          <div key={`temp-${index}`} className="bg-orange-50/50 p-6 rounded-xl shadow-sm border border-orange-200 flex justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                    <span className="bg-orange-200 text-orange-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Draft</span>
                    <p className="font-bold text-lg text-gray-800">
                      <span className="text-primary-orange mr-2">Q{questions.length + index + 1}.</span> {q.question}
                    </p>
                 </div>
                 <span className="bg-white text-primary-orange px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter border border-orange-100 whitespace-nowrap ml-4">
                    {q.marks} Marks
                 </span>
              </div>
              <div className="grid grid-cols-2 gap-4 ml-8">
                <div className={`p-2 rounded border ${q.correctAnswer === q.option1 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'bg-white/50 border-gray-100 text-gray-600'}`}>
                  1. {q.option1}
                </div>
                <div className={`p-2 rounded border ${q.correctAnswer === q.option2 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'bg-white/50 border-gray-100 text-gray-600'}`}>
                  2. {q.option2}
                </div>
                <div className={`p-2 rounded border ${q.correctAnswer === q.option3 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'bg-white/50 border-gray-100 text-gray-600'}`}>
                  3. {q.option3}
                </div>
                <div className={`p-2 rounded border ${q.correctAnswer === q.option4 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'bg-white/50 border-gray-100 text-gray-600'}`}>
                  4. {q.option4}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeTempQuestion(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        {/* Existing Questions */}
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                 <p className="font-bold text-lg text-gray-800">
                   <span className="text-primary-orange mr-2">Q{index + 1}.</span> {q.question}
                 </p>
                 <span className="bg-orange-50 text-primary-orange px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter border border-orange-100 whitespace-nowrap ml-4">
                    {q.marks} Marks
                 </span>
              </div>
              <div className="grid grid-cols-2 gap-4 ml-8">
                <div className={`p-2 rounded border ${q.correctAnswer === q.option1 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-gray-100 text-gray-600'}`}>
                  1. {q.option1}
                </div>
                <div className={`p-2 rounded border ${q.correctAnswer === q.option2 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-gray-100 text-gray-600'}`}>
                  2. {q.option2}
                </div>
                <div className={`p-2 rounded border ${q.correctAnswer === q.option3 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-gray-100 text-gray-600'}`}>
                  3. {q.option3}
                </div>
                <div className={`p-2 rounded border ${q.correctAnswer === q.option4 ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'border-gray-100 text-gray-600'}`}>
                  4. {q.option4}
                </div>
              </div>
            </div>
            <button
              onClick={() => deleteQuestion(q.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg h-fit transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        {questions.length === 0 && tempQuestions.length === 0 && (
          <div className="bg-gray-50 p-12 text-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No questions added yet. Start by adding one above!</p>
          </div>
        )}

        {tempQuestions.length > 0 && (
          <div className="pt-8">
             <button
                onClick={handleBulkSubmit}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Submit All Questions to Database ({tempQuestions.length})
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                This will permanently save all draft questions to the exam.
              </p>
          </div>
        )}
      </div>
    </div>
  );
};


export default ManageQuestions;
