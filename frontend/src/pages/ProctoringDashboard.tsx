import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { 
  Camera, 
  MessageSquare, 
  ShieldAlert, 
  History,
  Send,
  X,
  Monitor
} from 'lucide-react';

const ProctoringDashboard = () => {
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const socketRef = useRef<any>(null);

  const getTimeElapsed = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const sendWarning = () => {
    if (!selectedStudent || !warningMessage) return;

    socketRef.current.emit('send_warning', {
      studentSocketId: selectedStudent[0],
      userId: selectedStudent[1].userId,
      examId: selectedStudent[1].examId,
      message: warningMessage
    });

    setWarningMessage('');
    alert('Warning sent successfully');
  };

  const handleUpdateStudentList = useCallback((list: any) => {
    setActiveStudents(list);
  }, []);

  const handleReceiveFrame = useCallback((data: any) => {
    setActiveStudents(prev => prev.map(([sid, info]) => {
      if (sid === data.studentId) {
        return [sid, { ...info, lastFrame: data.frame }];
      }
      return [sid, info];
    }));
  }, []);

  const handleReceiveLog = useCallback((data: any) => {
    if (selectedStudent && selectedStudent[0] === data.studentId) {
      setStudentLogs(prev => [data, ...prev]);
    }
  }, [selectedStudent]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
    socketRef.current.emit('join-room', 'admin-monitoring');

    socketRef.current.on('active_students', handleUpdateStudentList);
    socketRef.current.on('admin-receive-frame', handleReceiveFrame);
    socketRef.current.on('admin-receive-log', handleReceiveLog);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [handleUpdateStudentList, handleReceiveFrame, handleReceiveLog]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white flex items-center gap-3">
             <Monitor size={40} className="text-red-500" /> Proctor Control
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Real-time surveillance & integrity management</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest block mb-1">Active Streams</span>
              <span className="text-2xl font-black text-white italic">{activeStudents.length}</span>
           </div>
           <div className="bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20">
              <span className="text-red-400 text-xs font-black uppercase tracking-widest block mb-1">Anomalies Detected</span>
              <span className="text-2xl font-black text-red-500 italic">--</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Student Grid */}
        <div className="col-span-12 lg:col-span-8">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeStudents.length === 0 && (
                <div className="col-span-full py-20 bg-slate-800/20 rounded-[40px] border-4 border-dashed border-slate-800 flex flex-col items-center justify-center">
                   <ShieldAlert size={80} className="text-slate-800 mb-6" />
                   <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest">No Active Sessions</h3>
                </div>
              )}
              {activeStudents.map(([socketId, student]) => (
                <div 
                  key={socketId}
                  onClick={() => {
                    setSelectedStudent([socketId, student]);
                    setStudentLogs([]);
                  }}
                  className={`group relative bg-slate-800/40 rounded-[32px] overflow-hidden border-2 transition-all cursor-pointer ${selectedStudent?.[0] === socketId ? 'border-red-500 scale-95 shadow-2xl shadow-red-500/20' : 'border-slate-700 hover:border-slate-500'}`}
                >
                  <div className="aspect-video bg-black relative">
                     {student.lastFrame ? (
                       <img src={student.lastFrame} alt={student.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 italic">
                          <Camera size={40} className="mb-2 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Connecting Feed...</span>
                       </div>
                     )}
                     <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-black/60 backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/10">
                           {student.name}
                        </span>
                     </div>
                     <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     </div>
                  </div>
                  
                  <div className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-black uppercase tracking-tighter leading-none">{student.examTitle}</h4>
                        <span className="text-[10px] font-black text-slate-500 uppercase">{getTimeElapsed(student.startTime)}</span>
                     </div>
                     <div className="flex gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${student.warnings > 5 ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                           Warnings: {student.warnings} / 10
                        </span>
                     </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Control Panel */}
        <div className="col-span-12 lg:col-span-4">
           {selectedStudent ? (
             <div className="bg-slate-800 rounded-[40px] border border-slate-700 overflow-hidden sticky top-8 shadow-2xl">
                <div className="p-8 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-red-500/20">
                         {selectedStudent[1].name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white italic">{selectedStudent[1].name}</h3>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SID: {selectedStudent[0].slice(0, 8)}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setSelectedStudent(null)}
                     className="text-slate-500 hover:text-white transition-colors"
                   >
                      <X size={24} />
                   </button>
                </div>

                <div className="p-8 space-y-8">
                   {/* Actions */}
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                         <MessageSquare size={14} className="text-red-500" /> Send Directive
                      </h5>
                      <div className="relative">
                         <textarea 
                           value={warningMessage}
                           onChange={(e) => setWarningMessage(e.target.value)}
                           className="w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none h-32 font-medium"
                           placeholder="Type critical warning message..."
                         />
                         <button 
                           onClick={sendWarning}
                           className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-600/20"
                         >
                            <Send size={20} />
                         </button>
                      </div>
                   </div>

                   {/* Activity Logs */}
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                         <History size={14} className="text-blue-500" /> Event Stream
                      </h5>
                      <div className="bg-slate-900 rounded-[32px] p-2 max-h-64 overflow-y-auto border border-slate-700 space-y-2">
                         {studentLogs.length === 0 && (
                           <div className="p-8 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                              Quiet Stream - No anomalies
                           </div>
                         )}
                         {studentLogs.map((log, i) => (
                           <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center group animate-in slide-in-from-right duration-300">
                              <span className="text-xs font-bold text-slate-300">{log.eventType}</span>
                              <span className="text-[9px] font-black text-slate-500 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Info Stats */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                         <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Risk Level</span>
                         <span className={`text-sm font-black italic ${selectedStudent[1].warnings > 7 ? 'text-red-500' : 'text-yellow-500'}`}>
                            {selectedStudent[1].warnings > 7 ? 'CRITICAL' : 'MODERATE'}
                         </span>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                         <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Environment</span>
                         <span className="text-sm font-black italic text-green-500">ENCRYPTED</span>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-slate-800/20 rounded-[40px] border-4 border-dashed border-slate-800 h-[600px] flex flex-col items-center justify-center p-12 text-center">
                <ShieldAlert size={64} className="text-slate-800 mb-6" />
                <h4 className="text-slate-700 font-black uppercase tracking-[0.3em] mb-4">Command Center Idle</h4>
                <p className="text-slate-700 text-xs font-bold uppercase leading-relaxed tracking-wider">Select a student stream from the grid to initiate direct command and surveillance override.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProctoringDashboard;
