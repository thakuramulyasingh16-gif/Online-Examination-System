const express = require('express');
const router = express.Router();
const { createExam, getExams, getExamById, deleteExam } = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExams).post(protect, admin, createExam);
router.route('/:id').get(protect, getExamById).delete(protect, admin, deleteExam);

module.exports = router;
