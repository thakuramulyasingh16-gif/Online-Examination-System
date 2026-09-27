const Result = require('../models/Result');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const User = require('../models/User');

const submitExam = async (req, res) => {
  try {
    const { examId, answers, status } = req.body; // answers: { questionId: selectedOption }, status: 'completed' | 'terminated'
    const questions = await Question.findAll({ where: { examId } });
    
    let score = 0;
    let totalMaxMarks = 0;
    
    questions.forEach((q) => {
      totalMaxMarks += q.marks || 1;
      if (answers[q.id] === q.correctAnswer) {
        score += q.marks || 1;
      }
    });

    const percentage = totalMaxMarks > 0 ? (score / totalMaxMarks) * 100 : 0;
    const result = await Result.create({
      userId: req.user.id,
      examId,
      score,
      percentage,
      status: status || 'completed'
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Exam, attributes: ['title'] },
      ],
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
      include: [{ model: Exam, attributes: ['title'] }],
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitExam, getResults, getUserResults };
