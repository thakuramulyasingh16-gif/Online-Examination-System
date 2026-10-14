const Result = require('../models/Result');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const User = require('../models/User');
const { getOverviewStats } = require('./adminController');

const submitExam = async (req, res) => {
  try {
    const { examId, answers, status } = req.body;
    if (!examId) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }

    // 1. Block duplicate submissions
    const existingResult = await Result.findOne({
      where: {
        userId: req.user.id,
        examId,
      },
    });

    if (existingResult) {
      return res.status(400).json({
        message: 'Duplicate submission blocked. You have already submitted this exam.',
        alreadySubmitted: true,
        resultId: existingResult.id,
      });
    }

    const exam = await Exam.findByPk(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const questions = await Question.findAll({
      where: { examId },
      order: [['id', 'ASC']],
    });

    // 2. Server-side score calculation with negative marking
    let score = 0;
    let totalMaxMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const negMark = exam.negativeMarking ? parseFloat(exam.negativeMarking) : 0;

    // 3. Save detailed per-question review snapshot
    const detailedReview = questions.map((q) => {
      const qMarks = q.marks !== undefined && q.marks !== null ? parseInt(q.marks) : 1;
      totalMaxMarks += qMarks;

      let studentAns = null;
      if (answers) {
        if (Array.isArray(answers)) {
          const found = answers.find((a) => a.questionId == q.id);
          if (found) studentAns = found.selectedOption || found.answer;
        } else if (typeof answers === 'object') {
          studentAns = answers[q.id] !== undefined ? answers[q.id] : answers[String(q.id)];
        }
      }

      const isAnswered = studentAns !== undefined && studentAns !== null && String(studentAns).trim() !== '';
      const isCorrect = isAnswered && String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

      let marksAwarded = 0;
      if (isAnswered) {
        if (isCorrect) {
          marksAwarded = qMarks;
          score += qMarks;
          correctCount++;
        } else {
          if (negMark > 0) {
            marksAwarded = -negMark;
            score -= negMark;
          }
          wrongCount++;
        }
      } else {
        skippedCount++;
      }

      return {
        questionId: q.id,
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        selectedOption: studentAns || null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        isAnswered,
        marksAwarded,
        maxMarks: qMarks,
        difficulty: q.difficulty || 'Medium',
        explanation: q.explanation || null,
      };
    });

    // Score cannot be negative overall
    score = Math.max(0, score);
    const percentage = totalMaxMarks > 0 ? (score / totalMaxMarks) * 100 : 0;
    const passMarks = exam.passMarks !== undefined ? parseInt(exam.passMarks) : 40;
    const passed = (score >= passMarks) || (percentage >= passMarks);

    const snapshotPayload = {
      rawAnswers: answers || {},
      detailedReview,
      summary: {
        totalQuestions: questions.length,
        correctCount,
        wrongCount,
        skippedCount,
        totalMaxMarks,
        passMarks,
        negativeMarking: negMark,
        passed,
      },
    };

    const result = await Result.create({
      userId: req.user.id,
      examId,
      score: Math.round(score * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      status: status || 'completed',
      answers: JSON.stringify(snapshotPayload),
    });

    res.status(201).json({
      ...result.toJSON(),
      detailedReview,
      passed,
    });
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const { examId, studentId } = req.query;
    const whereClause = {};
    if (examId) whereClause.examId = examId;
    if (studentId) whereClause.userId = studentId;

    const results = await Result.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'loginId', 'profileImage'] },
        {
          model: Exam,
          attributes: ['id', 'title', 'duration', 'totalMarks', 'passMarks', 'negativeMarking', 'createdAt'],
          include: [{ model: Question }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Exam,
          attributes: ['id', 'title', 'duration', 'totalMarks', 'passMarks', 'negativeMarking', 'createdAt'],
          include: [{ model: Question }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResultReview = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'loginId', 'email'] },
        {
          model: Exam,
          attributes: ['id', 'title', 'totalMarks', 'passMarks', 'negativeMarking'],
          include: [{ model: Question }],
        },
      ],
    });

    if (!result) return res.status(404).json({ message: 'Result not found' });

    // Authorization: only the student who took it or admin can view
    if (req.user.role !== 'admin' && result.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    let parsed = null;
    if (result.answers) {
      try {
        parsed = JSON.parse(result.answers);
      } catch (e) {
        parsed = { rawAnswers: result.answers };
      }
    }

    res.json({
      result,
      review: parsed?.detailedReview || null,
      summary: parsed?.summary || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportResults = async (req, res) => {
  try {
    const { examId } = req.query;
    const whereClause = {};
    if (examId) whereClause.examId = examId;

    const results = await Result.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'loginId'] },
        { model: Exam, attributes: ['id', 'title', 'totalMarks', 'passMarks'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Build CSV Content
    const headers = ['Result ID', 'Student Name', 'Login ID', 'Email', 'Exam Title', 'Score', 'Total Marks', 'Percentage', 'Status', 'Result', 'Date'];
    const rows = results.map((r) => {
      const passMarks = r.Exam?.passMarks || 40;
      const isPass = (r.percentage || 0) >= passMarks ? 'Passed' : 'Failed';
      const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

      return [
        r.id,
        clean(r.User?.name || 'N/A'),
        clean(r.User?.loginId || 'N/A'),
        clean(r.User?.email || 'N/A'),
        clean(r.Exam?.title || 'N/A'),
        r.score,
        r.Exam?.totalMarks || 100,
        `${r.percentage}%`,
        r.status,
        isPass,
        clean(new Date(r.createdAt).toLocaleString()),
      ].join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="exam-results-${Date.now()}.csv"`);
    res.send(csvData);
  } catch (error) {
    console.error('Export Results Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    await result.destroy();
    res.json({ message: 'Result record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitExam,
  getResults,
  getUserResults,
  getResultReview,
  exportResults,
  getResultStats: getOverviewStats,
  deleteResult,
};
