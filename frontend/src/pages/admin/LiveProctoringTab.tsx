import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  Monitor,
  Camera,
  AlertTriangle,
  Send,
  XCircle,
  Clock,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config';

interface ActiveStudentData {
  userId: number;
  name: string;
  examId: number;
  examTitle: string;
  status: string;
  warnings: number;
  startTime: string;
  lastFrame?: string;
  lastSeen?: string;
}

interface ActivityLogItem {
  id: string;
  studentId: string;
  studentName?: string;
  eventType: string;
  timestamp: string;
}

export const LiveProctoringTab: React.FC = () => {
  const { toast } = useToast();
  const socketRef = useRef<any>(null);

  // Active students: array of [socketId, info]
  const [activeStudents, setActiveStudents] = useState<[string, ActiveStudentData][]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // Modals
  const [warningTarget, setWarningTarget] = useState<[string, ActiveStudentData] | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [terminateTarget, setTerminateTarget] = useState<[string, ActiveStudentData] | null>(null);
  const [terminateReason, setTerminateReason] = useState('Repeated integrity violations detected.');

  // Pre-configured warning reasons
  const presetWarnings = [
    'Looking away from the screen repeatedly',
    'Multiple persons detected in webcam view',
    'Window lost focus / Tab switch detected',
    'Suspicious audio / conversation detected',
    'Mobile phone or unauthorized device detected',
  ];

  // Elapsed time helper
  const getTimeElapsed = (startTimeStr?: string) => {
    if (!startTimeStr) return '0m';
    const start = new Date(startTimeStr).getTime();
    const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  // Socket setup
  const handleUpdateActiveStudents = useCallback((list: any) => {
    setActiveStudents(list || []);
  }, []);

  const handleReceiveFrame = useCallback((data: any) => {
    setActiveStudents((prev) =>
      prev.map(([sid, info]) => {
        if (sid === data.studentId) {
          return [sid, { ...info, lastFrame: data.frame, lastSeen: new Date().toISOString() }];
        }
        return [sid, info];
      })
    );
  }, []);

  const handleReceiveLog = useCallback((data: any) => {
    const newLog: ActivityLogItem = {
      id: `${Date.now()}-${Math.random()}`,
      studentId: data.studentId,
      studentName: data.studentName || 'Active Candidate',
      eventType: data.eventType || 'Event detected',
      timestamp: data.timestamp || new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  }, []);

  useEffect(() => {
    socketRef.current = io(API_BASE_URL);
    socketRef.current.emit('join-room', 'admin-monitoring');

    socketRef.current.on('active_students', handleUpdateActiveStudents);
    socketRef.current.on('admin-receive-frame', handleReceiveFrame);
    socketRef.current.on('admin-receive-log', handleReceiveLog);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [handleUpdateActiveStudents, handleReceiveFrame, handleReceiveLog]);

  // Send Warning to Student
  const handleSendWarning = () => {
    if (!warningTarget || !warningMessage.trim()) return;
    const [socketId, info] = warningTarget;

    socketRef.current.emit('send_warning', {
      studentSocketId: socketId,
      userId: info.userId,
      examId: info.examId,
      message: warningMessage.trim(),
    });

    toast.warning(`Warning sent to ${info.name}: "${warningMessage.trim()}"`);
    setWarningTarget(null);
    setWarningMessage('');
  };

  // Terminate Student Exam
  const handleTerminateExam = () => {
    if (!terminateTarget) return;
    const [socketId, info] = terminateTarget;

    socketRef.current.emit('terminate_student_exam', {
      studentSocketId: socketId,
      userId: info.userId,
      examId: info.examId,
      reason: terminateReason.trim(),
    });

    toast.error(`Exam terminated for ${info.name}`);
    setTerminateTarget(null);
    setTerminateReason('Repeated integrity violations detected.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Surveillance Status Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-elevated border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Monitor className="text-rose-500" size={24} /> Live Proctoring Command Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate webcam feeds, automated anomaly detection, and session integrity enforcement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-700 text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
              Active Feeds
            </span>
            <span className="text-lg font-black text-rose-400 leading-none">
              {activeStudents.length} Students
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Active Students Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Camera size={16} className="text-primary-orange" />
              Live Candidate Streams ({activeStudents.length})
            </h3>
            <span className="text-xs text-slate-400">Stream updates via WebRTC / WebSocket</span>
          </div>

          {activeStudents.length === 0 ? (
            /* Standby Empty State */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Camera size={32} className="opacity-40" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                Surveillance Radar Idle
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                No students are currently taking a live proctored exam. Video feeds will stream in real-time as soon as students enter an assessment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeStudents.map(([socketId, student]) => {
                const warningsCount = student.warnings || 0;
                const isHighRisk = warningsCount >= 3;

                return (
                  <div
                    key={socketId}
                    className={`bg-slate-900 rounded-2xl overflow-hidden shadow-card border-2 transition-all ${
                      isHighRisk
                        ? 'border-rose-500 shadow-rose-950/40 ring-1 ring-rose-500'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Video Frame */}
                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                      {student.lastFrame ? (
                        <img
                          src={student.lastFrame}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-600 space-y-1">
                          <Camera size={28} className="opacity-30" />
                          <span className="text-[10px] text-slate-500">Connecting video feed...</span>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Live
                        </span>
                      </div>

                      {/* Warning Count Pill */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            warningsCount > 0
                              ? 'bg-rose-500 text-white font-black animate-bounce'
                              : 'bg-black/60 text-slate-300'
                          }`}
                        >
                          {warningsCount} / 10 Warnings
                        </span>
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
                        <p className="text-white font-bold text-xs truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-300 truncate">{student.examTitle}</p>
                      </div>
                    </div>

                    {/* Controls Footer */}
                    <div className="p-3 bg-slate-950 flex items-center justify-between gap-2 border-t border-slate-800">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={12} className="text-amber-500" />
                        <span>{getTimeElapsed(student.startTime)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setWarningTarget([socketId, student]);
                            setWarningMessage('Please keep your eyes focused on the screen.');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-[11px] transition-colors"
                          title="Issue Proctor Warning"
                        >
                          <AlertTriangle size={12} /> Warn
                        </button>

                        <button
                          onClick={() => {
                            setTerminateTarget([socketId, student]);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[11px] transition-colors"
                          title="Terminate Exam Session"
                        >
                          <XCircle size={12} /> Terminate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Real-time Activity Log Timeline (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Live Integrity Timeline
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Real-time</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
            {activityLogs.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                <ShieldAlert size={28} className="opacity-30 mb-2" />
                <p>No integrity anomalies detected</p>
                <p className="text-[11px] text-slate-500">Timeline streams tab changes, blur, and alerts</p>
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs space-y-1 animate-fade-in"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {log.studentName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1">
                    <AlertTriangle size={12} className="shrink-0" />
                    {log.eventType}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Send Warning Modal */}
      {warningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Send Warning to Candidate
                </h3>
                <p className="text-xs text-slate-400">
                  Candidate: <strong>{warningTarget[1].name}</strong>
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Quick Reason Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {presetWarnings.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWarningMessage(preset)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-primary-orange transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Warning Message (Displayed on candidate's screen)
              </label>
              <textarea
                rows={3}
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Type custom warning message..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWarningTarget(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!warningMessage.trim()}
                onClick={handleSendWarning}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-950/20 disabled:opacity-40 transition-all"
              >
                <Send size={14} /> Send Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Session Modal */}
      {terminateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Terminate Candidate's Exam
                </h3>
                <p className="text-xs text-slate-400">Session will immediately close for this student</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to forcibly terminate the examination for{' '}
              <strong className="text-slate-900 dark:text-white">"{terminateTarget[1].name}"</strong>? Their current exam answers will be submitted as terminated.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Termination
              </label>
              <textarea
                rows={2}
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTerminateTarget(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTerminateExam}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-950/30 transition-all"
              >
                Terminate Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
