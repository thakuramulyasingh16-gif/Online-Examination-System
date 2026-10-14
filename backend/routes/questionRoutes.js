const express = require('express');
const router = express.Router();
const {
  addQuestion,
  bulkAddQuestions,
  getQuestionsByExam,
  getAllQuestions,
  deleteQuestion,
  updateQuestion,
  copyQuestionToExam,
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/exam/:examId', protect, getQuestionsByExam);
router.get('/all', protect, admin, getAllQuestions);

router.post('/', protect, admin, addQuestion);
router.post('/bulk', protect, admin, bulkAddQuestions);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);
router.post('/:id/copy', protect, admin, copyQuestionToExam);

module.exports = router;
