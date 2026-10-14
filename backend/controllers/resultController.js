const Result = require('../models/Result');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const User = require('../models/User');

const submitExam = async (req, res) => {
  try {
    const { examId, answers, status } = req.body;
    const questions = await Question.findAll({ where: { examId } });
    const exam = await Exam.findByPk(examId);

    let score = 0;
    let totalMaxMarks = 0;
    const negMark = exam && exam.negativeMarking ? parseFloat(exam.negativeMarking) : 0;

    questions.forEach((q) => {
      const qMarks = q.marks || 1;
      totalMaxMarks += qMarks;
      const studentAns = answers ? answers[q.id] : undefined;
      if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
        if (studentAns === q.correctAnswer) {
          score += qMarks;
        } else if (negMark > 0) {
          score -= negMark;
        }
      }
    });

    // Score shouldn't be negative overall
    score = Math.max(0, score);
    const percentage = totalMaxMarks > 0 ? (score / totalMaxMarks) * 100 : 0;

    const result = await Result.create({
      userId: req.user.id,
      examId,
      score: Math.round(score * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      status: status || 'completed',
      answers: answers ? (typeof answers === 'object' ? JSON.stringify(answers) : answers) : null,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const results = await Result.findAll({
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

module.exports = { submitExam, getResults, getUserResults, deleteResult };
