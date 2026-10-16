import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';

// Admin Sub-Components
import { AdminSidebar } from './admin/AdminSidebar';
import type { AdminTab } from './admin/AdminSidebar';
import { AdminTopBar } from './admin/AdminTopBar';
import { OverviewTab } from './admin/OverviewTab';
import { StudentsTab } from './admin/StudentsTab';
import { ExamsTab } from './admin/ExamsTab';
import type { ExamItem } from './admin/ExamsTab';
import { QuestionsTab } from './admin/QuestionsTab';
import { ResultsTab } from './admin/ResultsTab';
import type { ResultItem } from './admin/ResultsTab';
import { LiveProctoringTab } from './admin/LiveProctoringTab';
import { SettingsTab } from './admin/SettingsTab';

interface AdminDashboardProps {
  defaultTab?: AdminTab;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ defaultTab }) => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State
  const initialTab = (defaultTab || (searchParams.get('tab') as AdminTab) || 'overview');
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialTab);

  // Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Live Proctoring Counter
  const [liveStudentsCount, setLiveStudentsCount] = useState(0);
  const socketRef = useRef<any>(null);

  // Selected Exam for Questions Tab drilldown
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState<number | null>(null);

  // Data States
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [results, setResults] = useState<ResultItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  const [collegeInfo, setCollegeInfo] = useState({
    collegeName: 'City College',
    collegeLogo: '/logo.jpg',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab Navigation Handler
  const handleSelectTab = (tab: AdminTab, params?: any) => {
    setCurrentTab(tab);
    setSearchParams({ tab });
    if (params?.examId) {
      setSelectedExamForQuestions(params.examId);
    }
  };

  // Fetch College Info
  const fetchCollegeInfo = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data) {
        setCollegeInfo({
          collegeName: data.collegeName || 'City College',
          collegeLogo: data.collegeLogo?.startsWith('http') || data.collegeLogo?.startsWith('/')
            ? data.collegeLogo
            : `${API_BASE_URL}${data.collegeLogo}`,
        });
      }
    } catch {
      // Fallback
    }
  };

  // Fetch Overview Stats
  const fetchOverviewStats = async () => {
    setLoadingOverview(true);
    try {
      const { data } = await api.get('/admin/overview');
      setOverviewStats(data);
    } catch {
      // Create fallback empty stats
      setOverviewStats({
        totalStudents: students.length,
        activeStudentsCount: students.length,
        totalExams: exams.length,
        liveExams: 0,
        averageScore: 0,
        totalAttempts: results.length,
        totalWarnings: 0,
        passFailDonut: { passed: 0, failed: 0 },
        examWiseAverage: [],
        last7DaysAttempts: [],
        recentActivity: [],
      });
    } finally {
      setLoadingOverview(false);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const { data } = await api.get('/students');
      setStudents(data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch Exams
  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const { data } = await api.get('/exams');
      setExams(data || []);
    } catch {
      toast.error('Failed to load examinations');
    } finally {
      setLoadingExams(false);
    }
  };

  // Fetch Results
  const fetchResults = async () => {
    setLoadingResults(true);
    try {
      const { data } = await api.get('/results/all');
      setResults(data || []);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setLoadingResults(false);
    }
  };

  // Global Refresh Action
  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchOverviewStats(),
        fetchStudents(),
        fetchExams(),
        fetchResults(),
        fetchCollegeInfo(),
      ]);
      toast.success('Dashboard data refreshed');
    } catch {
      toast.error('Error refreshing data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial Fetch & Socket Monitoring
  useEffect(() => {
    fetchCollegeInfo();
    fetchOverviewStats();
    fetchStudents();
    fetchExams();
    fetchResults();

    // Socket Connection for live student monitoring count
    socketRef.current = io(API_BASE_URL);
    socketRef.current.emit('join-room', 'admin-monitoring');

    socketRef.current.on('active_students', (activeList: any[]) => {
      setLiveStudentsCount(activeList ? activeList.length : 0);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Quick Action Config
  const quickActionMeta: { label?: string; action?: () => void } = {};
  if (currentTab === 'students') {
    quickActionMeta.label = 'Add Student';
    quickActionMeta.action = () => {};
  } else if (currentTab === 'exams') {
    quickActionMeta.label = 'Create Exam';
    quickActionMeta.action = () => {};
  } else if (currentTab === 'questions') {
    quickActionMeta.label = 'Add Question';
    quickActionMeta.action = () => {};
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        liveCount={liveStudentsCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        collegeInfo={collegeInfo}
      />

      {/* 2. Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Bar Header */}
        <AdminTopBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
          liveCount={liveStudentsCount}
          collegeName={collegeInfo.collegeName}
        />

        {/* Dynamic Tab Body View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewTab
              stats={overviewStats}
              loading={loadingOverview}
              onNavigateTab={handleSelectTab}
            />
          )}

          {currentTab === 'students' && (
            <StudentsTab
              students={students}
              loading={loadingStudents}
              onRefresh={() => {
                fetchStudents();
                fetchOverviewStats();
              }}
            />
          )}

          {currentTab === 'exams' && (
            <ExamsTab
              exams={exams}
              loading={loadingExams}
              onRefresh={() => {
                fetchExams();
                fetchOverviewStats();
              }}
              onNavigateTab={handleSelectTab}
              onSelectExamForQuestions={(examId) => {
                setSelectedExamForQuestions(examId);
                handleSelectTab('questions', { examId });
              }}
            />
          )}

          {currentTab === 'questions' && (
            <QuestionsTab
              exams={exams}
              selectedExamId={selectedExamForQuestions}
              onSelectExamId={setSelectedExamForQuestions}
            />
          )}

          {currentTab === 'results' && (
            <ResultsTab
              results={results}
              exams={exams}
              loading={loadingResults}
              onRefresh={() => {
                fetchResults();
                fetchOverviewStats();
              }}
            />
          )}

          {currentTab === 'proctoring' && <LiveProctoringTab />}

          {currentTab === 'settings' && (
            <SettingsTab
              onSettingsUpdated={() => {
                fetchCollegeInfo();
                fetchOverviewStats();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
