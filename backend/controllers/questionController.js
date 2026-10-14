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

const fs = require('fs');

const parseCsvQuestions = (csvText, defaultExamId) => {
  const lines = csvText.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    rows.push(rowObj);
  }

  return rows.map((r) => {
    let corrAns = r.correctanswer || r.correctoption || r.answer || r.ans || 'A';
    corrAns = String(corrAns).trim().toUpperCase();
    return {
      examId: r.examid ? parseInt(r.examid) : defaultExamId,
      question: r.question || r.questiontext || r.title || 'Untitled Question',
      option1: r.option1 || r.optiona || r.a || 'Option A',
      option2: r.option2 || r.optionb || r.b || 'Option B',
      option3: r.option3 || r.optionc || r.c || 'Option C',
      option4: r.option4 || r.optiond || r.d || 'Option D',
      correctAnswer: corrAns,
      marks: r.marks ? parseInt(r.marks) : 1,
      difficulty: r.difficulty || 'Medium',
      explanation: r.explanation || null,
    };
  });
};

const bulkAddQuestions = async (req, res) => {
  try {
    let questions = req.body;
    const defaultExamId = req.query.examId || (req.body && req.body.examId);

    if (req.file) {
      const content = fs.readFileSync(req.file.path, 'utf8');
      questions = parseCsvQuestions(content, defaultExamId);
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    } else if (typeof req.body === 'string' && req.body.includes(',')) {
      questions = parseCsvQuestions(req.body, defaultExamId);
    } else if (req.body && typeof req.body.csv === 'string') {
      questions = parseCsvQuestions(req.body.csv, defaultExamId || req.body.examId);
    } else if (req.body && Array.isArray(req.body.questions)) {
      questions = req.body.questions.map((q) => ({
        ...q,
        examId: q.examId || defaultExamId,
      }));
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Expected an array of questions or CSV file' });
    }

    const cleaned = questions.map((q) => ({
      examId: q.examId || defaultExamId,
      question: q.question,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correctAnswer: q.correctAnswer,
      marks: q.marks ? parseInt(q.marks) : 1,
      difficulty: q.difficulty || 'Medium',
      explanation: q.explanation || null,
    })).filter((q) => q.examId && q.question);

    if (cleaned.length === 0) {
      return res.status(400).json({ message: 'No valid questions found with an examId' });
    }

    const createdQuestions = await Question.bulkCreate(cleaned);
    res.status(201).json({
      message: `Successfully imported ${createdQuestions.length} questions`,
      count: createdQuestions.length,
      questions: createdQuestions,
    });
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
