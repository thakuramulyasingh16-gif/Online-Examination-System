const User = require('../models/User');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Warning = require('../models/Warning');
const ActivityLog = require('../models/ActivityLog');
const Setting = require('../models/Setting');
const { Op } = require('sequelize');

const getOverviewStats = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    const passThreshold = setting ? setting.passingCriteria : 40;

    // 1. Total Students
    const totalStudents = await User.count({ where: { role: 'student' } });
    const activeStudentsCount = await User.count({ where: { role: 'student', isActive: true } });

    // 2. Total Exams
    const totalExams = await Exam.count();

    // 3. Live Exams
    const now = new Date();
    const allPublishedExams = await Exam.findAll({ where: { isPublished: true } });
    const liveExams = allPublishedExams.filter((e) => {
      if (!e.scheduledAt && !e.endAt) return true;
      const start = e.scheduledAt ? new Date(e.scheduledAt) : null;
      const end = e.endAt ? new Date(e.endAt) : null;
      if (start && end) return now >= start && now <= end;
      if (start) return now >= start;
      if (end) return now <= end;
      return true;
    }).length;

    // 4. All Results for calculations
    const allResults = await Result.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'loginId'] },
        { model: Exam, attributes: ['id', 'title', 'passMarks', 'totalMarks'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const totalAttempts = allResults.length;
    const averageScore = totalAttempts > 0
      ? Math.round(allResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalAttempts)
      : 0;

    // 5. Total Warnings
    const totalWarnings = await Warning.count();

    // 6. Exam-wise Average Score Bar Chart
    const examMap = {};
    allResults.forEach((r) => {
      const examTitle = r.Exam?.title || 'Unknown Exam';
      if (!examMap[examTitle]) {
        examMap[examTitle] = { totalPct: 0, count: 0, passed: 0, failed: 0 };
      }
      examMap[examTitle].totalPct += r.percentage || 0;
      examMap[examTitle].count += 1;
      const passMark = r.Exam?.passMarks || passThreshold;
      if (r.percentage >= passMark) {
        examMap[examTitle].passed += 1;
      } else {
        examMap[examTitle].failed += 1;
      }
    });

    const examWiseAverage = Object.keys(examMap).map((title) => ({
      examTitle: title.length > 18 ? title.slice(0, 16) + '...' : title,
      fullTitle: title,
      avgScore: Math.round(examMap[title].totalPct / examMap[title].count),
      attempts: examMap[title].count,
      passed: examMap[title].passed,
      failed: examMap[title].failed,
    }));

    // If no attempts yet, populate dummy/placeholder exams so charts look great
    if (examWiseAverage.length === 0) {
      const examsList = await Exam.findAll({ limit: 4 });
      examsList.forEach((e) => {
        examWiseAverage.push({
          examTitle: e.title.length > 18 ? e.title.slice(0, 16) + '...' : e.title,
          fullTitle: e.title,
          avgScore: 0,
          attempts: 0,
          passed: 0,
          failed: 0,
        });
      });
    }

    // 7. Pass / Fail Donut
    let totalPassed = 0;
    let totalFailed = 0;
    allResults.forEach((r) => {
      const passMark = r.Exam?.passMarks || passThreshold;
      if (r.percentage >= passMark && r.status !== 'terminated') {
        totalPassed++;
      } else {
        totalFailed++;
      }
    });

    // 8. Last 7 Days Attempts Line Chart
    const last7DaysAttempts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayResults = allResults.filter((r) => {
        const rDate = new Date(r.createdAt);
        return rDate >= dayStart && rDate <= dayEnd;
      });

      const dayAttempts = dayResults.length;
      const dayAvg = dayAttempts > 0
        ? Math.round(dayResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / dayAttempts)
        : 0;

      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7DaysAttempts.push({
        date: dateLabel,
        attempts: dayAttempts,
        avgScore: dayAvg,
      });
    }

    // 9. Recent Activity Feed
    const recentActivity = [];

    // Recent results
    allResults.slice(0, 8).forEach((r) => {
      recentActivity.push({
        id: `res-${r.id}`,
        type: 'submission',
        title: `${r.User?.name || 'Student'} completed ${r.Exam?.title || 'Exam'}`,
        description: `Scored ${r.score} marks (${r.percentage}%) - ${r.percentage >= (r.Exam?.passMarks || 40) ? 'Passed' : 'Failed'}`,
        timestamp: r.createdAt,
        badge: r.percentage >= 40 ? 'Passed' : 'Failed',
        badgeColor: r.percentage >= 40 ? 'emerald' : 'rose',
      });
    });

    // Recent warnings
    const recentWarnings = await Warning.findAll({
      include: [
        { model: User, attributes: ['name'] },
        { model: Exam, attributes: ['title'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 6,
    });

    recentWarnings.forEach((w) => {
      recentActivity.push({
        id: `warn-${w.id}`,
        type: 'warning',
        title: `Proctoring Warning Issued`,
        description: `Student: ${w.User?.name || 'Candidate'} | Exam: ${w.Exam?.title || 'Assessment'} - "${w.message}"`,
        timestamp: w.createdAt,
        badge: `Warning #${w.count}`,
        badgeColor: 'amber',
      });
    });

    // Sort combined activity by timestamp descending
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      totalStudents,
      activeStudentsCount,
      totalExams,
      liveExams,
      averageScore,
      totalAttempts,
      totalWarnings,
      passFailDonut: {
        passed: totalPassed,
        failed: totalFailed,
      },
      examWiseAverage,
      last7DaysAttempts,
      recentActivity: recentActivity.slice(0, 15),
    });
  } catch (error) {
    console.error('Overview Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOverviewStats };
