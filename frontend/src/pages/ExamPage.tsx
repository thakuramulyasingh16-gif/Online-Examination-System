import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import {
  Timer,
  Camera,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Clock,
  Award,
  Shield,
  Maximize2,
  Info,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Check,
  ChevronUp,
  X,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';

interface QuestionItem {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: string;
  marks?: number;
}

interface SubmittedResultData {
  score: number;
  percentage: number;
  isPassed: boolean;
  totalMarks: number;
  correct: number;
  wrong: number;
  skipped: number;
}

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Pre-exam instruction screen state
  const [hasStartedExam, setHasStartedExam] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // Hardware readiness
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<{ message: string; count: number } | null>(null);
  const [securityModal, setSecurityModal] = useState<{ title: string; message: string } | null>(null);
  const [warningCount, setWarningCount] = useState<number>(0);
  const [isTerminated, setIsTerminated] = useState(false);

  // Submit Modal & Post-Submit Result Summary State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<SubmittedResultData | null>(null);

  // Mobile Bottom Sheet for Question Palette
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Request & Start Camera Preview
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsCameraActive(true);
      setIsMicActive(true);
      toast.success('Camera & Microphone verified successfully.', 'Hardware Ready');
    } catch (error: any) {
      console.error('Error accessing camera/mic:', error);
      setIsCameraActive(false);
      setIsMicActive(false);
      setCameraError(
        'Unable to access camera or microphone. Please allow camera permissions in your browser address bar.'
      );
      toast.error('Camera permission is required to take this exam.', 'Hardware Error');
    }
  };

  const stopProctoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log('Fullscreen request failed:', err));
    }
  };

  const fetchExam = async () => {
    try {
      const { data } = await api.get(`/exams/${id}`);

      // Check if student already completed this exam
      if (data.Results && data.Results.length > 0) {
        toast.warning(
          'You have already completed this examination. Access denied.',
          'Already Completed'
        );
        navigate('/');
        return;
      }

      setExam(data);
      const examQuestions: QuestionItem[] = data.Questions || [];
      setQuestions(examQuestions);

      // Restore saved progress from localStorage if available
      if (user && id) {
        try {
          const savedAnswers = localStorage.getItem(`exam_answers_${id}_${user.id}`);
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          }
          const savedReview = localStorage.getItem(`exam_review_${id}_${user.id}`);
          if (savedReview) {
            setMarkedForReview(JSON.parse(savedReview));
          }
          const savedVisited = localStorage.getItem(`exam_visited_${id}_${user.id}`);
          if (savedVisited) {
            setVisitedQuestions(JSON.parse(savedVisited));
          } else if (examQuestions.length > 0) {
            setVisitedQuestions([examQuestions[0].id]);
          }
          const savedIndex = localStorage.getItem(`exam_index_${id}_${user.id}`);
          if (savedIndex) {
            const idx = parseInt(savedIndex, 10);
            if (!isNaN(idx) && idx >= 0 && idx < examQuestions.length) {
              setCurrentQuestionIndex(idx);
            }
          }

          // Restore or calculate server-aligned timer
          const savedStartTime = localStorage.getItem(`exam_startTime_${id}_${user.id}`);
          const totalExamSeconds = data.duration * 60;
          if (savedStartTime) {
            const elapsed = Math.floor((Date.now() - parseInt(savedStartTime, 10)) / 1000);
            const remaining = Math.max(0, totalExamSeconds - elapsed);
            setTimeLeft(remaining);
            if (remaining > 0) {
              // Automatically resume if user reloads while taking exam
              setHasStartedExam(true);
            }
          } else {
            setTimeLeft(totalExamSeconds);
          }
        } catch (err) {
          console.warn('Error reading from localStorage:', err);
          setTimeLeft(data.duration * 60);
        }
      } else {
        setTimeLeft(data.duration * 60);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast.error('Error fetching examination data', 'Error');
      navigate('/');
    }
  };

  // Launch the exam after instructions & camera readiness
  const handleStartExam = () => {
    if (!isCameraActive) {
      toast.error('Please verify and enable your camera before starting.', 'Camera Required');
      return;
    }
    if (!isAgreed) {
      toast.error('Please read and agree to the examination instructions.', 'Agreement Required');
      return;
    }

    // Set start time in localStorage if not already recorded
    if (user && id) {
      const existingStart = localStorage.getItem(`exam_startTime_${id}_${user.id}`);
      if (!existingStart) {
        localStorage.setItem(`exam_startTime_${id}_${user.id}`, Date.now().toString());
      }
      if (questions.length > 0) {
        const initialVisited = [questions[0].id];
        setVisitedQuestions(initialVisited);
        localStorage.setItem(`exam_visited_${id}_${user.id}`, JSON.stringify(initialVisited));
      }
    }

    enterFullscreen();
    setHasStartedExam(true);

    // Attach stream to active exam video
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }

    // Join proctoring socket room
    if (socketRef.current && user) {
      socketRef.current.emit('student_join', {
        userId: user.id,
        name: user.name,
        examId: id,
        examTitle: exam?.title,
      });
    }
  };

  const captureAndSendFrame = () => {
    if (videoRef.current && canvasRef.current && socketRef.current && isCameraActive && hasStartedExam) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context && video.videoWidth > 0) {
        canvas.width = 320;
        canvas.height = 240;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL('image/jpeg', 0.5);
        socketRef.current.emit('student-frame', {
          studentName: user?.name,
          examId: id,
          frame: frame,
        });
      }
    }
  };

  const logActivity = (eventType: string) => {
    if (socketRef.current && user && hasStartedExam) {
      socketRef.current.emit('student-activity-log', {
        userId: user.id,
        examId: id,
        eventType,
      });
    }
  };

  // Submit Handler
  const handleSubmit = async (status: 'completed' | 'terminated' = 'completed') => {
    try {
      setSubmitting(true);
      stopProctoring();
      setIsCameraActive(false);
      setIsMicActive(false);
      if (socketRef.current) socketRef.current.disconnect();

      // Clean in-flight timer, review, index localStorage keys
      if (user && id) {
        try {
          localStorage.setItem(`exam_answers_${id}_${user.id}`, JSON.stringify(answers));
          localStorage.removeItem(`exam_startTime_${id}_${user.id}`);
          localStorage.removeItem(`exam_review_${id}_${user.id}`);
          localStorage.removeItem(`exam_visited_${id}_${user.id}`);
          localStorage.removeItem(`exam_index_${id}_${user.id}`);
        } catch (e) {
          console.warn('Could not update answers in localStorage', e);
        }
      }

      const { data } = await api.post('/results/submit', { examId: id, answers, status });

      if (status === 'terminated') {
        setIsTerminated(true);
        setShowSubmitModal(false);
        return;
      }

      // Calculate score breakdown for immediate celebratory summary screen
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;
      let maxMarks = 0;

      questions.forEach((q) => {
        maxMarks += q.marks || 1;
        const studentAns = answers[q.id];
        if (!studentAns) {
          skippedCount += 1;
        } else if (studentAns === q.correctAnswer) {
          correctCount += 1;
        } else {
          wrongCount += 1;
        }
      });

      const percentage = data.percentage ?? (maxMarks > 0 ? (data.score / maxMarks) * 100 : 0);
      const isPassed = percentage >= 40;

      if (isPassed) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (err) {
          console.log('Confetti triggered');
        }
      }

      setSubmittedResult({
        score: data.score,
        percentage,
        isPassed,
        totalMarks: maxMarks,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
      });

      setShowSubmitModal(false);
      toast.success('Examination submitted successfully!', 'Submitted');
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Error submitting exam. Please check your connection.', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };

  // Option selection with auto-save to localStorage
  const handleOptionChange = (qId: number, value: string) => {
    const updated = { ...answers, [qId]: value };
    setAnswers(updated);
    if (user && id) {
      try {
        localStorage.setItem(`exam_answers_${id}_${user.id}`, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not auto-save answers', err);
      }
    }
  };

  // Clear Response for current question
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    const updated = { ...answers };
    delete updated[currentQuestion.id];
    setAnswers(updated);
    if (user && id) {
      try {
        localStorage.setItem(`exam_answers_${id}_${user.id}`, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not clear response in localStorage', err);
      }
    }
    toast.info('Response cleared for this question.', 'Cleared');
  };

  // Mark / Unmark for Review toggle
  const handleToggleReview = () => {
    if (!currentQuestion) return;
    let updated: number[];
    if (markedForReview.includes(currentQuestion.id)) {
      updated = markedForReview.filter((qid) => qid !== currentQuestion.id);
      toast.info('Removed from Mark for Review', 'Updated');
    } else {
      updated = [...markedForReview, currentQuestion.id];
      toast.info('Marked for Review', 'Marked');
    }
    setMarkedForReview(updated);
    if (user && id) {
      try {
        localStorage.setItem(`exam_review_${id}_${user.id}`, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not auto-save review markers', err);
      }
    }
  };

  // Navigate to a specific question and track visited state
  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      const targetQ = questions[index];
      if (targetQ && !visitedQuestions.includes(targetQ.id)) {
        const updated = [...visitedQuestions, targetQ.id];
        setVisitedQuestions(updated);
        if (user && id) {
          try {
            localStorage.setItem(`exam_visited_${id}_${user.id}`, JSON.stringify(updated));
            localStorage.setItem(`exam_index_${id}_${user.id}`, index.toString());
          } catch (err) {
            console.warn('Could not save visited index', err);
          }
        }
      }
      setIsMobilePaletteOpen(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      jumpToQuestion(currentQuestionIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      jumpToQuestion(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Palette counts summary
  const paletteStats = useMemo(() => {
    let answered = 0;
    let marked = markedForReview.length;
    let notAnswered = 0;
    let notVisited = 0;

    questions.forEach((q) => {
      const isAns = !!answers[q.id];
      const isVisited = visitedQuestions.includes(q.id);

      if (isAns) {
        answered += 1;
      } else if (isVisited) {
        notAnswered += 1;
      } else {
        notVisited += 1;
      }
    });

    return { answered, marked, notAnswered, notVisited };
  }, [questions, answers, markedForReview, visitedQuestions]);

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(API_BASE_URL);

    socketRef.current.on('receive_warning', (data: any) => {
      setWarning(data);
      if (data.count) {
        setWarningCount(data.count);
        if (data.count >= 10) {
          handleSubmit('terminated');
        }
      }
    });

    socketRef.current.on('student-exam-terminated', () => {
      handleSubmit('terminated');
    });

    fetchExam();
    startCamera();

    // Security & Anti-Cheating Restrictions
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logActivity('Right-Click Context Menu Attempt');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logActivity('Copy Attempt');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      logActivity('Cut Attempt');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logActivity('Paste Attempt');
    };

    const handleVisibilityChange = () => {
      if (document.hidden && hasStartedExam && !submittedResult) {
        logActivity('Tab Switched / Window Minimized');
        setWarningCount((prev) => {
          const next = prev + 1;
          if (next >= 10) {
            handleSubmit('terminated');
          }
          return next;
        });
        setSecurityModal({
          title: 'Tab Switch Violation Detected',
          message:
            'You navigated away from the examination window. This action has been logged by the proctoring authority. Continued tab switching will result in immediate termination.',
        });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStartedExam && !submittedResult) {
        logActivity('Exited Fullscreen');
        setSecurityModal({
          title: 'Fullscreen Mode Required',
          message:
            'You exited fullscreen mode. All assessments must be completed in continuous fullscreen. Please re-enter fullscreen immediately.',
        });
      }
    };

    const handleBlur = () => {
      if (hasStartedExam && !submittedResult) {
        logActivity('Window Focus Lost');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      stopProctoring();
      if (socketRef.current) socketRef.current.disconnect();
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [id, hasStartedExam, submittedResult]);

  // Frame streaming interval to proctoring backend
  useEffect(() => {
    if (isCameraActive && socketRef.current && user && hasStartedExam && !submittedResult) {
      const interval = setInterval(captureAndSendFrame, 3000);
      return () => clearInterval(interval);
    }
  }, [isCameraActive, user, hasStartedExam, submittedResult]);

  // Countdown timer effect with server/localStorage persistence
  useEffect(() => {
    if (!hasStartedExam || submittedResult || isTerminated) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !loading && questions.length > 0) {
      toast.warning('Time expired! Submitting your examination automatically...', 'Time Expired');
      handleSubmit('completed');
    }
  }, [timeLeft, loading, questions.length, isTerminated, hasStartedExam, submittedResult]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-sm text-slate-600 dark:text-slate-400">
          Preparing secure examination environment...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TERMINATION SCREEN
  // -------------------------------------------------------------
  if (isTerminated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl space-y-6 border border-rose-500/30 animate-fade-in">
          <div className="bg-rose-100 dark:bg-rose-950/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <XCircle size={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Examination Terminated
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Your examination session has been terminated by the proctoring authority due to exceeding the maximum warning threshold (10 warnings) or verified academic misconduct.
          </p>
          <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            Recorded Violations: {warningCount} / 10 Threshold Exceeded
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Return to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RESULT SUMMARY SCREEN (POST SUBMISSION WITH CONFETTI)
  // -------------------------------------------------------------
  if (submittedResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8 animate-fade-in">
        <Card className="max-w-2xl w-full p-8 md:p-12 text-center shadow-elevated border border-slate-200/80 dark:border-slate-800 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-500 via-primary-orange to-amber-500" />

          {/* Celebratory Icon */}
          <div className="mx-auto">
            {submittedResult.isPassed ? (
              <div className="w-24 h-24 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg border border-emerald-200 dark:border-emerald-800 animate-bounce">
                <Sparkles size={52} />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-orange-100 dark:bg-orange-950/50 text-primary-orange flex items-center justify-center mx-auto shadow-lg border border-orange-200 dark:border-orange-800">
                <Award size={52} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                submittedResult.isPassed
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {submittedResult.isPassed ? 'Congratulations! Examination Passed' : 'Assessment Completed'}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {exam?.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
              Your responses have been processed and recorded securely in the academic portal.
            </p>
          </div>

          {/* Score Badge Hero */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Final Score Obtained
              </span>
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-1">
                {submittedResult.score}{' '}
                <span className="text-lg font-bold text-slate-400">/ {submittedResult.totalMarks}</span>
              </p>
            </div>

            <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block" />

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Percentage
              </span>
              <p className="text-4xl md:text-5xl font-black text-primary-orange mt-1">
                {submittedResult.percentage.toFixed(1)}%
              </p>
            </div>

            <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block" />

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Status
              </span>
              <div className="mt-1">
                <Badge
                  variant={submittedResult.isPassed ? 'success' : 'danger'}
                  size="md"
                  dot
                >
                  {submittedResult.isPassed ? 'PASS (Satisfactory)' : 'FAIL (< 40%)'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Correct
              </span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {submittedResult.correct}
              </p>
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/50">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                Incorrect
              </span>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
                {submittedResult.wrong}
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                Skipped
              </span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {submittedResult.skipped}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => navigate('/results')}
              className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-primary-orange hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <BarChart2 size={16} /> View Detailed Scorecard & Review
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-3.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 1: PRE-EXAM INSTRUCTIONS & HARDWARE READINESS CHECK
  // -------------------------------------------------------------
  if (!hasStartedExam) {
    const totalQuestions = questions.length;
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 animate-fade-in pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <img
                src="/logo.jpg"
                alt="City College Logo"
                className="w-12 h-12 rounded-xl object-cover border border-orange-200/80 shadow-sm"
              />
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-orange">
                  Pre-Examination Briefing
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {exam?.title}
                </h1>
              </div>
            </div>

            <Badge variant="primary" size="md">
              Secure Assessment
            </Badge>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-primary-orange rounded-xl">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {exam?.duration} Minutes
                </p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {totalQuestions} MCQs
                </p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                <Award size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Marks</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{totalMarks}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                <Info size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Negative Marking</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">None (0.00)</p>
              </div>
            </Card>
          </div>

          {/* Main Grid: Instructions & Camera Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Examination Rules (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Shield className="text-primary-orange" size={20} />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Examination Rules & Code of Conduct
                  </h3>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-primary-orange font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      <strong>Fullscreen Mandate:</strong> The assessment runs strictly in fullscreen mode. Any attempt to exit fullscreen will log a violation.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-primary-orange font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      <strong>Prohibited Activities:</strong> Tab switching, opening additional windows, right-clicking, copying, or pasting questions is locked and automatically flagged.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-primary-orange font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      <strong>Webcam Supervision:</strong> Your webcam must remain active throughout the test. Ensure your face is centered and well-lit.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-primary-orange font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <span>
                      <strong>Warning Limit:</strong> A maximum of <strong>10 warnings</strong> are permitted. Exceeding this limit will trigger automatic disqualification and submission.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-primary-orange font-bold flex items-center justify-center shrink-0 text-[11px]">
                      5
                    </span>
                    <span>
                      <strong>Auto Submission:</strong> When the countdown timer reaches 00:00, your current answers will be submitted automatically.
                    </span>
                  </li>
                </ul>
              </Card>

              {/* Agreement Checkbox */}
              <div className="p-4 bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/50 rounded-2xl">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-primary-orange rounded-md cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal">
                    I agree to the Examination Rules and Code of Conduct. I acknowledge that my session will be live-monitored via webcam and browser activity.
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column: Camera Permission & Verification (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Camera className="text-primary-orange" size={18} />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Hardware Readiness Check
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCameraActive ? (
                      <Badge variant="success" size="sm" dot>
                        Camera Ready
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm" dot>
                        Camera Required
                      </Badge>
                    )}
                    {isMicActive && (
                      <Badge variant="success" size="sm" dot>
                        Mic Ready
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Video Preview Box */}
                <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-inner">
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isCameraActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {!isCameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
                      <Camera size={40} className="text-slate-500 animate-pulse" />
                      <p className="text-xs font-bold">
                        {cameraError ? cameraError : 'Camera feed offline. Click below to grant access.'}
                      </p>
                    </div>
                  )}

                  {isCameraActive && (
                    <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 border border-emerald-500/30">
                      <CheckCircle2 size={12} /> Feed active: {user?.name}
                    </div>
                  )}
                </div>

                {!isCameraActive && (
                  <button
                    onClick={startCamera}
                    className="w-full py-2.5 bg-primary-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Camera size={15} /> Enable Camera & Microphone
                  </button>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  Live verification is continuous. Ensure adequate ambient lighting and quiet surroundings.
                </p>
              </Card>

              {/* Start Examination Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartExam}
                  disabled={!isCameraActive || !isAgreed}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                    isCameraActive && isAgreed
                      ? 'bg-gradient-to-r from-orange-500 to-primary-orange hover:from-orange-600 hover:to-orange-500 text-white hover:scale-[1.02] cursor-pointer shadow-orange-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Maximize2 size={18} />
                  {isCameraActive && isAgreed
                    ? 'Start Examination (Enter Fullscreen)'
                    : 'Complete Steps Above to Start'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: ACTIVE ONLINE EXAMINATION INTERFACE
  // -------------------------------------------------------------
  const isLast5Minutes = timeLeft <= 300;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-12 select-none">
      <canvas ref={canvasRef} className="hidden" />

      {/* Proctoring Warning Modal (from socket) */}
      {warning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-rose-500">
            <div className="flex items-center gap-4 text-rose-600 mb-6">
              <div className="bg-rose-100 dark:bg-rose-950/60 p-3 rounded-2xl">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Proctor Alert</h2>
                <p className="text-xs font-bold text-rose-500">
                  Warning {warning.count} of 10
                </p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-5 rounded-2xl border border-rose-200 dark:border-rose-900 mb-6">
              <p className="text-rose-700 dark:text-rose-300 font-bold text-base leading-snug">
                "{warning.message}"
              </p>
            </div>

            <button
              onClick={() => setWarning(null)}
              className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-rose-700 transition-all shadow-lg active:scale-95"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Security Violation Modal (Tab Switch, Fullscreen Exit) */}
      {securityModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-amber-500">
            <div className="flex items-center gap-4 text-amber-600 mb-4">
              <div className="bg-amber-100 dark:bg-amber-950/60 p-3 rounded-2xl">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">{securityModal.title}</h2>
                <p className="text-xs font-bold text-amber-600">
                  Total Warnings: {warningCount} / 10
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
              {securityModal.message}
            </p>

            <button
              onClick={() => {
                setSecurityModal(null);
                enterFullscreen();
              }}
              className="w-full bg-primary-orange hover:bg-orange-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Resume Examination
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Examination Confirmation"
        description="Please review your attempt summary below before final submission."
      >
        <div className="space-y-6 pt-2">
          {/* Summary Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Questions</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {questions.length}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-center">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Answered
              </span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {paletteStats.answered}
              </p>
            </div>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-center">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                Unanswered
              </span>
              <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">
                {questions.length - paletteStats.answered}
              </p>
            </div>

            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 text-center">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                Marked Review
              </span>
              <p className="text-xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                {paletteStats.marked}
              </p>
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200/80 dark:border-orange-900/40 flex items-start gap-3">
            <Info size={18} className="text-primary-orange shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to finish and submit your exam? Once submitted, your scores will be calculated and answers cannot be modified.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setShowSubmitModal(false)}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel & Continue
            </button>
            <button
              onClick={() => handleSubmit('completed')}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-primary-orange hover:from-orange-600 hover:to-orange-500 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check size={16} /> Yes, Submit Final
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* TOP STICKY BAR */}
      <header className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft z-40 border-b border-slate-200/80 dark:border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Brand & Title */}
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="City College"
              className="h-9 w-9 rounded-xl object-cover border border-orange-200/80 shadow-sm shrink-0"
            />
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-orange block leading-tight">
                {exam?.subject || 'Assessment Session'}
              </span>
              <h1 className="text-sm md:text-base font-black text-slate-900 dark:text-white truncate">
                {exam?.title}
              </h1>
            </div>
          </div>

          {/* Right Timer & Submit Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Countdown Timer with 5-minute red pulse */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-widest transition-all ${
                isLast5Minutes
                  ? 'bg-rose-600 text-white border-2 border-rose-500 animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-orange-50 dark:bg-orange-950/50 text-primary-orange border border-orange-200/70 dark:border-orange-900/50'
              }`}
              title={isLast5Minutes ? 'Less than 5 minutes remaining!' : 'Time Remaining'}
            >
              <Timer size={16} className={isLast5Minutes ? 'animate-spin' : ''} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Check size={15} /> Submit
            </button>
          </div>
        </div>
      </header>

      {/* MAIN EXAM LAYOUT */}
      <div className="max-w-7xl mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE QUESTION CARD (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Proctoring Camera Lost Warning */}
          {!isCameraActive && (
            <div className="bg-rose-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="shrink-0" />
                <div>
                  <p className="font-black text-xs uppercase">Proctoring Camera Lost</p>
                  <p className="text-[11px] text-rose-100">
                    Enable camera immediately to avoid disciplinary disqualification.
                  </p>
                </div>
              </div>
              <button
                onClick={startCamera}
                className="bg-white text-rose-600 px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-rose-50"
              >
                Retry
              </button>
            </div>
          )}

          {currentQuestion && (
            <Card className="p-6 md:p-8 space-y-6 shadow-card transition-all">
              {/* Question Header & Marks */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center rounded-xl font-black text-sm shrink-0 shadow-sm">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {markedForReview.includes(currentQuestion.id) && (
                    <Badge variant="warning" size="sm">
                      <Bookmark size={11} className="fill-amber-500" /> Marked for Review
                    </Badge>
                  )}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    Marks: +{currentQuestion.marks || 1} / -0.00
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="py-2">
                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Large Clickable MCQ Options */}
              <div className="space-y-3">
                {[
                  { key: 'A', text: currentQuestion.option1 },
                  { key: 'B', text: currentQuestion.option2 },
                  { key: 'C', text: currentQuestion.option3 },
                  { key: 'D', text: currentQuestion.option4 },
                ].map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.text;

                  return (
                    <div
                      key={option.key}
                      onClick={() => handleOptionChange(currentQuestion.id, option.text)}
                      className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none group ${
                        isSelected
                          ? 'border-primary-orange ring-2 ring-primary-orange/20 bg-orange-50/70 dark:bg-orange-950/40 text-slate-900 dark:text-white font-bold shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Option Letter Indicator */}
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-primary-orange text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200'
                        }`}
                      >
                        {option.key}
                      </span>

                      {/* Option Text */}
                      <span className="text-sm md:text-base flex-1 leading-normal">
                        {option.text}
                      </span>

                      {/* Radio Dot Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-primary-orange bg-primary-orange'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={14} /> Previous
                  </button>

                  {/* Clear Response */}
                  {answers[currentQuestion.id] && (
                    <button
                      onClick={handleClearResponse}
                      className="px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
                      title="Clear current selection"
                    >
                      <RotateCcw size={13} /> Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Mark for Review Button */}
                  <button
                    onClick={handleToggleReview}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                      markedForReview.includes(currentQuestion.id)
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                        : 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60 hover:bg-purple-50'
                    }`}
                  >
                    <Bookmark size={14} />
                    {markedForReview.includes(currentQuestion.id) ? 'Unmark Review' : 'Mark for Review'}
                  </button>

                  {/* Next / Review Button */}
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-primary-orange hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      Review & Submit <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: DESKTOP QUESTION PALETTE & WEBCAM (4 cols) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Live Proctoring Webcam Feed */}
          <Card className="p-4 space-y-3 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Live Proctoring Feed
              </span>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                Warnings: {warningCount} / 10
              </span>
            </div>

            <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isCameraActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 text-center">
                  <Camera className="text-rose-500 mb-1 animate-pulse" size={28} />
                  <p className="text-[10px] font-bold">Camera Offline</p>
                </div>
              )}
              {isCameraActive && (
                <div className="absolute bottom-2 left-2 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-emerald-400 flex items-center gap-1 border border-emerald-500/20">
                  <CheckCircle2 size={10} /> Active
                </div>
              )}
            </div>
          </Card>

          {/* Question Palette Card */}
          <Card className="p-5 space-y-5 shadow-card">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Question Palette
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any number to jump directly to that question.
              </p>
            </div>

            {/* Visual Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-emerald-500 shrink-0" />
                <span>Answered ({paletteStats.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-rose-500 shrink-0" />
                <span>Not Answered ({paletteStats.notAnswered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-purple-600 shrink-0" />
                <span>Marked ({paletteStats.marked})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-slate-300 dark:bg-slate-700 shrink-0" />
                <span>Not Visited ({paletteStats.notVisited})</span>
              </div>
            </div>

            {/* Palette Numbers Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const isCurrent = currentQuestionIndex === i;
                const isMarked = markedForReview.includes(q.id);
                const isAnswered = !!answers[q.id];
                const isVisited = visitedQuestions.includes(q.id);

                let colorClasses =
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600';

                if (isMarked) {
                  colorClasses = 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20';
                } else if (isAnswered) {
                  colorClasses = 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20';
                } else if (isVisited) {
                  colorClasses = 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(i)}
                    className={`h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center relative ${colorClasses} ${
                      isCurrent
                        ? 'ring-2 ring-primary-orange ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-105'
                        : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={16} /> Submit Exam
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* MOBILE FLOATING PALETTE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 z-30 shadow-elevated flex items-center justify-between gap-3">
        <button
          onClick={() => setIsMobilePaletteOpen(true)}
          className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-black flex items-center justify-between transition-colors"
        >
          <span>Question Palette ({paletteStats.answered}/{questions.length})</span>
          <ChevronUp size={16} className="text-primary-orange" />
        </button>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="py-2.5 px-5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 shadow-md"
        >
          Submit
        </button>
      </div>

      {/* MOBILE PALETTE BOTTOM SHEET DRAWER */}
      {isMobilePaletteOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobilePaletteOpen(false)}
          />

          <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-6 space-y-5 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto animate-fade-in z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Question Palette
                </h3>
                <p className="text-xs text-slate-400">
                  Tap any question number to view and answer.
                </p>
              </div>
              <button
                onClick={() => setIsMobilePaletteOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-emerald-500 shrink-0" />
                <span>Answered ({paletteStats.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-rose-500 shrink-0" />
                <span>Not Answered ({paletteStats.notAnswered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-purple-600 shrink-0" />
                <span>Marked ({paletteStats.marked})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-slate-300 dark:bg-slate-700 shrink-0" />
                <span>Not Visited ({paletteStats.notVisited})</span>
              </div>
            </div>

            {/* Mobile Grid */}
            <div className="grid grid-cols-5 gap-2 py-2">
              {questions.map((q, i) => {
                const isCurrent = currentQuestionIndex === i;
                const isMarked = markedForReview.includes(q.id);
                const isAnswered = !!answers[q.id];
                const isVisited = visitedQuestions.includes(q.id);

                let colorClasses =
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

                if (isMarked) {
                  colorClasses = 'bg-purple-600 text-white';
                } else if (isAnswered) {
                  colorClasses = 'bg-emerald-500 text-white';
                } else if (isVisited) {
                  colorClasses = 'bg-rose-500 text-white';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(i)}
                    className={`h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-primary-orange ring-offset-2' : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
