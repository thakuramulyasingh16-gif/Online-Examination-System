import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Card, Input, Button } from '../components/ui';

const CreateExam = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/exams', { title, duration: parseInt(duration) });
      toast.success('Exam created successfully! Now add questions.', 'Exam Created');
      navigate(`/admin/exam/${data.id}/questions`);
    } catch {
      toast.error('Error creating exam. Please try again.', 'Creation Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
          title="Back to Dashboard"
        >
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create New Exam</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure exam details and duration</p>
        </div>
      </div>

      <Card className="p-8 sm:p-10 border-t-4 border-t-primary-orange">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Exam Title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Final Mathematics Assessment"
            leftIcon={<FileText size={18} className="text-primary-orange" />}
          />
          <Input
            label="Duration (Minutes)"
            type="number"
            min="1"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 60"
            leftIcon={<Clock size={18} className="text-amber-500" />}
          />
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Next: Add Questions
            </Button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
              You'll be redirected to the question management page after creation.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateExam;
