import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Timer, Camera, Mic, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';
import logo from '../assets/logo.png';

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [warning, setWarning] = useState<{message: string, count: number} | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<any>(null);

  const currentQuestion = questions[currentQuestionIndex];

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

  const fetchExam = async () => {
    try {
      const { data } = await api.get(`/exams/${id}`);
      
      // Check if already completed
      if (data.Results && data.Results.length > 0) {
        alert('You have already completed this examination. Access denied.');
        navigate('/');
        return;
      }

      setExam(data);
      const randomized = data.Questions.sort(() => Math.random() - 0.5);
      setQuestions(randomized);
      setTimeLeft(data.duration * 60);
      setLoading(false);
      
      // Start Socket and monitoring
      socketRef.current.emit('student_join', {
        userId: user?.id,
        name: user?.name,
        examId: id,
        examTitle: data.title
      });

    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('Error fetching exam');
      navigate('/');
    }
  };

  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setIsMicActive(true);
    } catch (error) {
      console.error('Error accessing camera/mic:', error);
      setIsCameraActive(false);
      setIsMicActive(false);
    }
  };

  const stopProctoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndSendFrame = () => {
    if (videoRef.current && canvasRef.current && socketRef.current && isCameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 320;
        canvas.height = 240;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL('image/jpeg', 0.5);
        socketRef.current.emit('student-frame', {
          studentName: user?.name,
          examId: id,
          frame: frame
        });
      }
    }
  };

  const logActivity = (eventType: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('student-activity-log', {
        userId: user.id,
        examId: id,
        eventType
      });
    }
  };

  const handleSubmit = async (status: 'completed' | 'terminated' = 'completed') => {
    try {
      stopProctoring();
      setIsCameraActive(false);
      setIsMicActive(false);
      if (socketRef.current) socketRef.current.disconnect();

      await api.post('/results/submit', { examId: id, answers, status });
      if (status === 'terminated') {
        setIsTerminated(true);
      } else {
        alert('Exam submitted successfully!');
        navigate('/results');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Error submitting exam');
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

  // Fullscreen Management
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
    
    socketRef.current.on('receive_warning', (data: any) => {
      setWarning(data);
    });

    socketRef.current.on('student-exam-terminated', (data: any) => {
      handleSubmit('terminated');
    });

    fetchExam();
    startProctoring();

    // Restrictions
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyPaste = (e: ClipboardEvent) => {
        e.preventDefault();
        logActivity(`Attempted ${e.type}`);
    };
    const handleVisibilityChange = () => {
        if (document.hidden) {
            logActivity('Tab Switched / Minimized');
        }
    };
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            logActivity('Exited Fullscreen');
        }
    };
    const handleBlur = () => logActivity('Window Focus Lost');
    const handleFocus = () => logActivity('Window Focus Regained');

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
  }, [id]);

  useEffect(() => {
    if (isCameraActive && socketRef.current && user) {
      const interval = setInterval(captureAndSendFrame, 3000);
      return () => clearInterval(interval);
    }
  }, [isCameraActive, user]);

  useEffect(() => {
    if (timeLeft > 0 && !isTerminated) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !loading && questions.length > 0 && !isTerminated) {
      handleSubmit('completed');
    }
  }, [timeLeft, loading, questions.length, isTerminated]);

  if (isTerminated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl space-y-6">
           <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-red-600">
             <XCircle size={64} />
           </div>
           <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Exam Terminated</h1>
           <p className="text-gray-500 text-lg">Your exam has been automatically terminated due to excessive proctoring warnings or misconduct.</p>
           <div className="bg-gray-50 p-4 rounded-xl text-sm font-medium text-gray-600 border border-gray-100">
             Reason: Exceeded maximum warning limit (10)
           </div>
           <button 
             onClick={() => navigate('/')}
             className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
           >
             Return to Dashboard
           </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold text-primary-orange animate-pulse">Initializing Secure Environment...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 select-none">
      <canvas ref={canvasRef} className="hidden" />

      {/* Warning Modal */}
      {warning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-red-500 animate-in zoom-in duration-300">
            <div className="flex items-center gap-4 text-red-600 mb-6">
              <div className="bg-red-100 p-3 rounded-2xl">
                <ShieldAlert size={32} />
              </div>
              <div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Proctor Alert</h2>
                 <p className="text-xs font-bold text-red-400">Warning {warning.count} of 10</p>
              </div>
            </div>
            
            <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 mb-8">
               <p className="text-red-700 font-bold text-lg leading-tight">"{warning.message}"</p>
            </div>

            <button 
              onClick={() => setWarning(null)}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl active:scale-95"
            >
              I UNDERSTAND & ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-40 p-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img src={logo} alt="College Logo" className="h-12 w-auto object-contain" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">{exam?.title}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black tracking-widest ${timeLeft < 300 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-800 shadow-inner'}`}>
              <Timer size={18} /> {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 px-4">
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isCameraActive ? 'text-green-600' : 'text-red-500'}`}>
                   <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-600' : 'bg-red-500 animate-ping'}`} />
                   {isCameraActive ? 'Camera Active' : 'Camera Error'}
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isMicActive ? 'text-green-600' : 'text-red-500'}`}>
                   <div className={`w-2 h-2 rounded-full ${isMicActive ? 'bg-green-600' : 'bg-red-500 animate-ping'}`} />
                   {isMicActive ? 'Mic Active' : 'Mic Error'}
                </div>
             </div>

             <button
               onClick={() => { if(window.confirm('Are you sure you want to finish the exam?')) handleSubmit('completed'); }}
               className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-200 active:scale-95"
             >
               Finish Exam
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8 px-4">
        {/* Exam Area */}
        <div className="lg:col-span-3 space-y-8">
          {!isCameraActive && (
            <div className="bg-red-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-2xl shadow-red-200 animate-bounce">
              <div className="flex items-center gap-4">
                <AlertTriangle size={32} />
                <div>
                   <p className="font-black uppercase tracking-tighter text-xl leading-none">Proctoring Disabled</p>
                   <p className="text-xs font-bold text-red-100 mt-1 uppercase tracking-widest">Enable camera immediately to avoid disqualification</p>
                </div>
              </div>
              <button 
                onClick={startProctoring}
                className="bg-white text-red-600 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors"
              >
                Retry Camera
              </button>
            </div>
          )}

          {currentQuestion && (
            <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8 group transition-all hover:shadow-2xl hover:border-primary-orange/20">
              <div className="flex gap-6">
                 <span className="flex-shrink-0 w-14 h-14 bg-gray-900 text-white flex items-center justify-center rounded-2xl font-black text-2xl shadow-xl italic group-hover:bg-primary-orange transition-colors">
                   {currentQuestionIndex + 1}
                 </span>
                 <p className="text-2xl font-bold text-gray-800 pt-2 leading-snug">{currentQuestion.question}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-20">
                {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4].map((opt, i) => (
                  <label 
                    key={i} 
                    className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all ${answers[currentQuestion.id] === opt ? 'bg-orange-50 border-primary-orange shadow-inner translate-y-1' : 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-white'}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      className="w-6 h-6 accent-primary-orange"
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() => handleOptionChange(currentQuestion.id, opt)}
                    />
                    <span className={`text-lg font-bold ${answers[currentQuestion.id] === opt ? 'text-primary-orange' : 'text-gray-700'}`}>{opt}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all ${currentQuestionIndex === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-black active:scale-95'}`}
                >
                  Previous Question
                </button>
                <div className="flex gap-2">
                   {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-primary-orange text-white rounded-2xl font-bold hover:bg-orange-600 transition-all active:scale-95"
                      >
                        Next Question
                      </button>
                   ) : (
                      <button
                        onClick={() => { if(window.confirm('This is the last question. Finish exam?')) handleSubmit('completed'); }}
                        className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all active:scale-95"
                      >
                        Final Submit
                      </button>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proctoring Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live Monitoring Feed
                </h3>
                <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl group">
                   <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-700 ${!isCameraActive ? 'opacity-0' : 'opacity-100'}`}
                   />
                   {!isCameraActive && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                        <Camera className="text-red-500 mb-4 animate-pulse" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sensor Offline</p>
                     </div>
                   )}
                   <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                      <p className="text-[8px] text-white font-black uppercase tracking-widest">{user?.name}</p>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                   <div className="flex justify-between items-end mb-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress Map</h4>
                      <span className="text-xl font-black italic text-gray-900">{Object.keys(answers).length}<span className="text-gray-300 text-sm not-italic ml-1">/ {questions.length}</span></span>
                   </div>
                   <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, i) => (
                        <button 
                          key={q.id} 
                          onClick={() => setCurrentQuestionIndex(i)}
                          className={`h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentQuestionIndex === i ? 'ring-2 ring-primary-orange ring-offset-2' : ''} ${answers[q.id] ? 'bg-primary-orange text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400 border border-gray-100 hover:bg-gray-200'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl shadow-gray-400/20">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="text-primary-orange" size={24} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Secure Protocol</h4>
               </div>
               <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">
                  Every interaction is monitored. Tab switches, window blurring, and unauthorized key combinations are logged and flagged for review.
               </p>
               <button 
                onClick={enterFullscreen}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/10"
               >
                Repair Fullscreen
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
