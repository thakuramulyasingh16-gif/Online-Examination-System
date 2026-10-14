import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, ArrowLeft, HelpCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Card, Button, EmptyState } from '../components/ui';

const ManageQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    try {
      const { data } = await api.get(`/questions/exam/${id}`);
      setQuestions(data);
    } catch {
      toast.error('Failed to load questions');
    }
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
    toast.info('Draft question queued. Click "Submit All Questions" when done.', 'Question Added');
  };

  const handleBulkSubmit = async () => {
    if (tempQuestions.length === 0) return;
    try {
      await api.post('/questions/bulk', tempQuestions);
      setTempQuestions([]);
      fetchQuestions();
      toast.success('All questions added successfully!', 'Questions Saved');
    } catch {
      toast.error('Error adding questions. Please try again.', 'Error');
    }
  };

  const deleteQuestion = async (qId: number) => {
    if (window.confirm('Delete this question?')) {
      try {
        await api.delete(`/questions/${qId}`);
        toast.success('Question deleted successfully');
        fetchQuestions();
      } catch {
        toast.error('Failed to delete question');
      }
    }
  };

  const removeTempQuestion = (index: number) => {
    setTempQuestions(tempQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
            title="Back to Dashboard"
          >
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Manage Questions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add and organize examination questions</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/')}
          variant="secondary"
          size="md"
        >
          Finish
        </Button>
      </div>

      <Card className="p-8 sm:p-10 border-t-4 border-t-primary-orange">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <Plus className="text-primary-orange" /> Add New MCQ Question
        </h2>
        <form onSubmit={handleAddTemp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Question Text
              </label>
              <textarea
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none h-24 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm transition-all"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your question here..."
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Question Marks
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none font-bold text-lg h-24 text-center text-slate-900 dark:text-slate-100 transition-all"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-center uppercase font-bold">Points / Marks</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Option 1
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                value={formData.option1}
                onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                placeholder="Option 1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Option 2
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                value={formData.option2}
                onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                placeholder="Option 2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Option 3
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                value={formData.option3}
                onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                placeholder="Option 3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Option 4
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                value={formData.option4}
                onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                placeholder="Option 4"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary-orange mb-1.5">
              Correct Answer
            </label>
            <select
              required
              className="w-full px-4 py-2.5 bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none text-slate-900 dark:text-slate-100 text-sm font-semibold transition-all"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            >
              <option value="">Select Correct Option</option>
              {formData.option1 && <option value={formData.option1}>Option 1: {formData.option1}</option>}
              {formData.option2 && <option value={formData.option2}>Option 2: {formData.option2}</option>}
              {formData.option3 && <option value={formData.option3}>Option 3: {formData.option3}</option>}
              {formData.option4 && <option value={formData.option4}>Option 4: {formData.option4}</option>}
            </select>
            <p className="text-xs text-slate-400 mt-1.5">Make sure to fill all options before selecting the correct answer.</p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
          >
            Add Question to Exam
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="text-secondary-yellow" /> Question Bank ({questions.length + tempQuestions.length})
          </h2>
          {tempQuestions.length > 0 && (
            <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
              {tempQuestions.length} unsaved questions
            </span>
          )}
        </div>

        {/* Temporary Questions */}
        {tempQuestions.map((q, index) => (
          <div key={`temp-${index}`} className="bg-orange-50/60 dark:bg-orange-950/20 p-6 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-800 flex justify-between gap-4 animate-fade-in">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-200 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Draft</span>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">
                    <span className="text-primary-orange mr-2">Q{questions.length + index + 1}.</span> {q.question}
                  </p>
                </div>
                <span className="bg-white dark:bg-slate-800 text-primary-orange px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-orange-200 dark:border-orange-800/60 whitespace-nowrap ml-4">
                  {q.marks} Marks
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-2 sm:ml-8">
                {[q.option1, q.option2, q.option3, q.option4].map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2.5 rounded-xl border text-sm ${
                      q.correctAnswer === opt
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {oIdx + 1}. {opt}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => removeTempQuestion(index)}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl h-fit transition-colors"
              title="Remove draft question"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        {/* Existing Questions */}
        {questions.map((q, index) => (
          <Card key={q.id} className="p-6 flex justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <p className="font-bold text-lg text-slate-900 dark:text-white">
                  <span className="text-primary-orange mr-2">Q{index + 1}.</span> {q.question}
                </p>
                <span className="bg-orange-50 dark:bg-orange-950/40 text-primary-orange px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-orange-200 dark:border-orange-800/60 whitespace-nowrap ml-4">
                  {q.marks} Marks
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-2 sm:ml-8">
                {[q.option1, q.option2, q.option3, q.option4].map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2.5 rounded-xl border text-sm ${
                      q.correctAnswer === opt
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {oIdx + 1}. {opt}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => deleteQuestion(q.id)}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl h-fit transition-colors"
              title="Delete question"
            >
              <Trash2 size={20} />
            </button>
          </Card>
        ))}

        {questions.length === 0 && tempQuestions.length === 0 && (
          <EmptyState
            title="No questions added yet"
            description="Start by formulating and adding multiple-choice questions above for your exam."
          />
        )}

        {tempQuestions.length > 0 && (
          <div className="pt-6">
            <Button
              onClick={handleBulkSubmit}
              variant="primary"
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md"
            >
              Submit All Questions to Database ({tempQuestions.length})
            </Button>
            <p className="text-center text-xs text-slate-400 mt-2">
              This will permanently save all draft questions to the exam.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;
