const express = require('express');
const router = express.Router();
const { addQuestion, bulkAddQuestions, getQuestionsByExam, deleteQuestion, updateQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, addQuestion);
router.route('/bulk').post(protect, admin, bulkAddQuestions);
router.route('/:examId').get(protect, getQuestionsByExam);
router.route('/:id').delete(protect, admin, deleteQuestion).put(protect, admin, updateQuestion);

module.exports = router;
