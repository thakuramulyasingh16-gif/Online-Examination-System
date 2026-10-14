import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
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
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Pre-exam instruction screen state
  const [hasStartedExam, setHasStartedExam] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // Hardware readiness
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<{ message: string; count: number } | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);

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
      const randomized = [...data.Questions].sort(() => Math.random() - 0.5);
      setQuestions(randomized);
      setTimeLeft(data.duration * 60);
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

  const handleSubmit = async (status: 'completed' | 'terminated' = 'completed') => {
    try {
      stopProctoring();
      setIsCameraActive(false);
      setIsMicActive(false);
      if (socketRef.current) socketRef.current.disconnect();

      // Save student answers in localStorage for detailed question review
      if (user && id) {
        try {
          localStorage.setItem(`exam_answers_${id}_${user.id}`, JSON.stringify(answers));
        } catch (e) {
          console.warn('Could not cache answers to localStorage', e);
        }
      }

      await api.post('/results/submit', { examId: id, answers, status });
      if (status === 'terminated') {
        setIsTerminated(true);
      } else {
        toast.success('Exam submitted successfully!', 'Submitted');
        navigate('/results');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Error submitting exam. Please check your connection.', 'Submission Error');
    }
  };

  const handleOptionChange = (qId: number, value: string) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(API_BASE_URL);

    socketRef.current.on('receive_warning', (data: any) => {
      setWarning(data);
    });

    socketRef.current.on('student-exam-terminated', () => {
      handleSubmit('terminated');
    });

    fetchExam();
    startCamera();

    // Browser proctoring security restrictions
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logActivity(`Attempted ${e.type}`);
    };
    const handleVisibilityChange = () => {
      if (document.hidden && hasStartedExam) {
        logActivity('Tab Switched / Window Minimized');
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStartedExam) {
        logActivity('Exited Fullscreen');
      }
    };
    const handleBlur = () => {
      if (hasStartedExam) logActivity('Window Focus Lost');
    };
    const handleFocus = () => {
      if (hasStartedExam) logActivity('Window Focus Regained');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      stopProctoring();
      if (socketRef.current) socketRef.current.disconnect();
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, hasStartedExam]);

  // Frame streaming interval
  useEffect(() => {
    if (isCameraActive && socketRef.current && user && hasStartedExam) {
      const interval = setInterval(captureAndSendFrame, 3000);
      return () => clearInterval(interval);
    }
  }, [isCameraActive, user, hasStartedExam]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!hasStartedExam) return;

    if (timeLeft > 0 && !isTerminated) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !loading && questions.length > 0 && !isTerminated) {
      handleSubmit('completed');
    }
  }, [timeLeft, loading, questions.length, isTerminated, hasStartedExam]);

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

  if (isTerminated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl space-y-6 border border-rose-500/30">
          <div className="bg-rose-100 dark:bg-rose-950/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <XCircle size={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Examination Terminated
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Your examination session has been terminated by the proctoring authority due to excessive warnings or academic misconduct.
          </p>
          <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            Reason: Maximum threshold of 10 proctoring warnings exceeded.
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
  // SCREEN 2: ACTIVE EXAMINATION INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 select-none">
      <canvas ref={canvasRef} className="hidden" />

      {/* Warning Modal */}
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

      {/* Top Sticky Test Bar */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm z-40 p-3.5 md:p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="City College"
              className="h-9 w-9 rounded-xl object-cover border border-orange-200/80 shadow-sm shrink-0"
            />
            <h1 className="text-base md:text-xl font-black text-slate-900 dark:text-white truncate">
              {exam?.title}
            </h1>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-widest shrink-0 ${
                timeLeft < 300
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-orange-50 dark:bg-orange-950/50 text-primary-orange border border-orange-200/60'
              }`}
            >
              <Timer size={16} /> {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 py-1.5 px-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
              <div
                className={`flex items-center gap-1.5 font-bold ${
                  isCameraActive ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCameraActive ? 'bg-emerald-600' : 'bg-rose-500 animate-ping'
                  }`}
                />
                {isCameraActive ? 'Camera Live' : 'Camera Error'}
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to finish and submit your exam?')) {
                  handleSubmit('completed');
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
            >
              Finish Exam
            </button>
          </div>
        </div>
      </div>

      {/* Main Examination View */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 px-4">
        {/* Left Column: Question Card (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {!isCameraActive && (
            <div className="bg-rose-600 text-white p-4 md:p-6 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} />
                <div>
                  <p className="font-black text-sm uppercase">Proctoring Camera Lost</p>
                  <p className="text-xs text-rose-100">
                    Enable your camera immediately to avoid automatic disqualification.
                  </p>
                </div>
              </div>
              <button
                onClick={startCamera}
                className="bg-white text-rose-600 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-rose-50"
              >
                Retry
              </button>
            </div>
          )}

          {currentQuestion && (
            <Card className="p-6 md:p-10 space-y-8 shadow-card">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center rounded-2xl font-black text-lg md:text-xl shrink-0 shadow-md">
                  {currentQuestionIndex + 1}
                </span>
                <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white pt-1 leading-snug">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  currentQuestion.option1,
                  currentQuestion.option2,
                  currentQuestion.option3,
                  currentQuestion.option4,
                ].map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3.5 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      answers[currentQuestion.id] === opt
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-primary-orange shadow-sm text-primary-orange'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      className="w-5 h-5 accent-primary-orange cursor-pointer"
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() => handleOptionChange(currentQuestion.id, opt)}
                    />
                    <span className="text-sm font-bold">{opt}</span>
                  </label>
                ))}
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    currentQuestionIndex === 0
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900'
                  }`}
                >
                  Previous
                </button>

                <div>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-primary-orange text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-all shadow-md"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.confirm('This is the final question. Submit examination now?')) {
                          handleSubmit('completed');
                        }
                      }}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md"
                    >
                      Final Submit
                    </button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Live Camera Box & Question Grid (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Live Proctoring Feed
            </h3>

            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-md">
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
                  <Camera className="text-rose-500 mb-2 animate-pulse" size={32} />
                  <p className="text-[10px] font-bold">Camera Offline</p>
                </div>
              )}
            </div>

            {/* Question Progress Grid */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Answered Questions</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {Object.keys(answers).length} / {questions.length}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`h-9 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                      currentQuestionIndex === i
                        ? 'ring-2 ring-primary-orange ring-offset-2'
                        : ''
                    } ${
                      answers[q.id]
                        ? 'bg-primary-orange text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4 text-xs space-y-2 bg-slate-900 text-white">
            <div className="flex items-center gap-2 text-primary-orange font-bold">
              <ShieldAlert size={16} /> Integrity Guard Active
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Window focus and screen state are logged. Keep this window active and maximized.
            </p>
            <button
              onClick={enterFullscreen}
              className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold transition-colors"
            >
              Re-enter Fullscreen
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
