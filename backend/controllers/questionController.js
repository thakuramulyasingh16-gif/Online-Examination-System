const Question = require('../models/Question');
const Exam = require('../models/Exam');

const addQuestion = async (req, res) => {
  try {
    const {
      examId,
      question,
      option1,
      option2,
      option3,
      option4,
      correctAnswer,
      marks,
      difficulty,
      explanation,
    } = req.body;

    const q = await Question.create({
      examId,
      question,
      option1,
      option2,
      option3,
      option4,
      correctAnswer,
      marks: marks ? parseInt(marks) : 1,
      difficulty: difficulty || 'Medium',
      explanation: explanation || null,
    });
    res.status(201).json(q);
  } catch (error) {
    console.error('Add Question Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const bulkAddQuestions = async (req, res) => {
  try {
    const questions = req.body; // Expecting an array of question objects
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'Expected an array of questions' });
    }

    const cleaned = questions.map((q) => ({
      examId: q.examId,
      question: q.question,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correctAnswer: q.correctAnswer,
      marks: q.marks ? parseInt(q.marks) : 1,
      difficulty: q.difficulty || 'Medium',
      explanation: q.explanation || null,
    }));

    const createdQuestions = await Question.bulkCreate(cleaned);
    res.status(201).json(createdQuestions);
  } catch (error) {
    console.error('Bulk Add Questions Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getQuestionsByExam = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { examId: req.params.examId },
      order: [['id', 'ASC']],
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        {
          model: Exam,
          attributes: ['id', 'title', 'subject'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
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
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const {
      question,
      option1,
      option2,
      option3,
      option4,
      correctAnswer,
      marks,
      difficulty,
      explanation,
    } = req.body;

    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });

    const updateData = {};
    if (question !== undefined) updateData.question = question;
    if (option1 !== undefined) updateData.option1 = option1;
    if (option2 !== undefined) updateData.option2 = option2;
    if (option3 !== undefined) updateData.option3 = option3;
    if (option4 !== undefined) updateData.option4 = option4;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (marks !== undefined) updateData.marks = parseInt(marks);
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (explanation !== undefined) updateData.explanation = explanation;

    await q.update(updateData);
    res.json(q);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const copyQuestionToExam = async (req, res) => {
  try {
    const { targetExamId } = req.body;
    const sourceQuestion = await Question.findByPk(req.params.id);
    if (!sourceQuestion) return res.status(404).json({ message: 'Question not found' });

    const newQuestion = await Question.create({
      examId: targetExamId,
      question: sourceQuestion.question,
      option1: sourceQuestion.option1,
      option2: sourceQuestion.option2,
      option3: sourceQuestion.option3,
      option4: sourceQuestion.option4,
      correctAnswer: sourceQuestion.correctAnswer,
      marks: sourceQuestion.marks,
      difficulty: sourceQuestion.difficulty,
      explanation: sourceQuestion.explanation,
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addQuestion,
  bulkAddQuestions,
  getQuestionsByExam,
  getAllQuestions,
  deleteQuestion,
  updateQuestion,
  copyQuestionToExam,
};
