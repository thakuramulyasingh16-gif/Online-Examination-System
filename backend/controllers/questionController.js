const Question = require('../models/Question');

const addQuestion = async (req, res) => {
  try {
    const { examId, question, option1, option2, option3, option4, correctAnswer, marks } = req.body;
    const q = await Question.create({ examId, question, option1, option2, option3, option4, correctAnswer, marks: marks || 1 });
    res.status(201).json(q);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkAddQuestions = async (req, res) => {
  try {
    const questions = req.body; // Expecting an array of question objects
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'Expected an array of questions' });
    }
    const createdQuestions = await Question.bulkCreate(questions);
    res.status(201).json(createdQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestionsByExam = async (req, res) => {
  try {
    const questions = await Question.findAll({ where: { examId: req.params.examId } });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    await q.destroy();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
    try {
        const { question, option1, option2, option3, option4, correctAnswer, marks } = req.body;
        const q = await Question.findByPk(req.params.id);
        if (!q) return res.status(404).json({ message: 'Question not found' });
        await q.update({ question, option1, option2, option3, option4, correctAnswer, marks });
        res.json(q);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { addQuestion, bulkAddQuestions, getQuestionsByExam, deleteQuestion, updateQuestion };
