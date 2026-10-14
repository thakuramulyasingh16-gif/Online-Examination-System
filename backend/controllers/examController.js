const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

const createExam = async (req, res) => {
  try {
    const {
      title,
      duration,
      subject,
      totalMarks,
      passMarks,
      negativeMarking,
      shuffle,
      shuffleQuestions,
      shuffleOptions,
      isPublished,
      startTime,
      endTime,
      scheduledAt,
      endAt,
    } = req.body;

    const start = startTime || scheduledAt || null;
    const end = endTime || endAt || null;
    const isShuffle = shuffle === true || shuffle === 'true' || shuffleQuestions === true || shuffleQuestions === 'true';

    const exam = await Exam.create({
      title,
      duration: duration ? parseInt(duration) : 60,
      subject: subject || null,
      totalMarks: totalMarks !== undefined ? parseInt(totalMarks) : 100,
      passMarks: passMarks !== undefined ? parseInt(passMarks) : 40,
      negativeMarking: negativeMarking !== undefined ? parseFloat(negativeMarking) : 0,
      shuffle: isShuffle,
      shuffleQuestions: isShuffle,
      shuffleOptions: shuffleOptions === true || shuffleOptions === 'true',
      isPublished: isPublished !== false && isPublished !== 'false',
      startTime: start,
      endTime: end,
      scheduledAt: start,
      endAt: end,
      createdBy: req.user.id,
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error('Create Exam Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const {
      title,
      duration,
      subject,
      totalMarks,
      passMarks,
      negativeMarking,
      shuffle,
      shuffleQuestions,
      shuffleOptions,
      isPublished,
      startTime,
      endTime,
      scheduledAt,
      endAt,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (subject !== undefined) updateData.subject = subject;
    if (totalMarks !== undefined) updateData.totalMarks = parseInt(totalMarks);
    if (passMarks !== undefined) updateData.passMarks = parseInt(passMarks);
    if (negativeMarking !== undefined) updateData.negativeMarking = parseFloat(negativeMarking);
    if (shuffle !== undefined || shuffleQuestions !== undefined) {
      const isShuffle = (shuffle === true || shuffle === 'true' || shuffleQuestions === true || shuffleQuestions === 'true');
      updateData.shuffle = isShuffle;
      updateData.shuffleQuestions = isShuffle;
    }
    if (shuffleOptions !== undefined) updateData.shuffleOptions = shuffleOptions === true || shuffleOptions === 'true';
    if (isPublished !== undefined) updateData.isPublished = isPublished === true || isPublished === 'true';
    if (startTime !== undefined || scheduledAt !== undefined) {
      const s = startTime || scheduledAt || null;
      updateData.startTime = s;
      updateData.scheduledAt = s;
    }
    if (endTime !== undefined || endAt !== undefined) {
      const e = endTime || endAt || null;
      updateData.endTime = e;
      updateData.endAt = e;
    }

    await exam.update(updateData);
    res.json(exam);
  } catch (error) {
    console.error('Update Exam Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const duplicateExam = async (req, res) => {
  try {
    const sourceExam = await Exam.findByPk(req.params.id, {
      include: [{ model: Question }],
    });
    if (!sourceExam) return res.status(404).json({ message: 'Source exam not found' });

    // Create cloned exam
    const newExam = await Exam.create({
      title: `${sourceExam.title} (Copy)`,
      duration: sourceExam.duration,
      subject: sourceExam.subject,
      totalMarks: sourceExam.totalMarks,
      passMarks: sourceExam.passMarks,
      negativeMarking: sourceExam.negativeMarking,
      shuffle: sourceExam.shuffle || sourceExam.shuffleQuestions || false,
      shuffleQuestions: sourceExam.shuffleQuestions || sourceExam.shuffle || false,
      shuffleOptions: sourceExam.shuffleOptions || false,
      isPublished: false, // Start copies as drafts/unpublished
      startTime: sourceExam.startTime || sourceExam.scheduledAt,
      endTime: sourceExam.endTime || sourceExam.endAt,
      scheduledAt: sourceExam.scheduledAt || sourceExam.startTime,
      endAt: sourceExam.endAt || sourceExam.endTime,
      createdBy: req.user.id,
    });

    // Clone all questions
    if (sourceExam.Questions && sourceExam.Questions.length > 0) {
      const questionsToClone = sourceExam.Questions.map((q) => ({
        examId: newExam.id,
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        difficulty: q.difficulty || 'Medium',
        explanation: q.explanation || null,
      }));
      await Question.bulkCreate(questionsToClone);
    }

    const createdWithQuestions = await Exam.findByPk(newExam.id, {
      include: [{ model: Question }],
    });

    res.status(201).json(createdWithQuestions);
  } catch (error) {
    console.error('Duplicate Exam Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const togglePublishExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExams = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const whereClause = isAdmin ? {} : { isPublished: true };

    const exams = await Exam.findAll({
      where: whereClause,
      include: [
        {
          model: Question,
          attributes: ['id', 'marks', 'difficulty', 'question'],
          required: false,
        },
        {
          model: Result,
          where: isAdmin ? undefined : { userId: req.user.id },
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
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
          where: req.user.role === 'admin' ? undefined : { userId: req.user.id },
          required: false,
        },
      ],
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
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExam,
  updateExam,
  duplicateExam,
  togglePublishExam,
  getExams,
  getExamById,
  deleteExam,
};
