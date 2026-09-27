const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

const createExam = async (req, res) => {
  try {
    const { title, duration } = req.body;
    const exam = await Exam.create({ title, duration, createdBy: req.user.id });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        {
          model: Result,
          where: { userId: req.user.id },
          required: false
        }
      ]
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        { model: Question },
        {
          model: Result,
          where: { userId: req.user.id },
          required: false
        }
      ]
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await exam.destroy();
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExam, getExams, getExamById, deleteExam };
