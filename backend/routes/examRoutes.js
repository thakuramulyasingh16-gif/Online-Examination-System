const express = require('express');
const router = express.Router();
const {
  createExam,
  updateExam,
  duplicateExam,
  togglePublishExam,
  getExams,
  getExamById,
  deleteExam,
} = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getExams);
router.get('/:id', protect, getExamById);

// Admin-only routes
router.post('/', protect, admin, createExam);
router.put('/:id', protect, admin, updateExam);
router.post('/:id/duplicate', protect, admin, duplicateExam);
router.put('/:id/toggle-publish', protect, admin, togglePublishExam);
router.delete('/:id', protect, admin, deleteExam);

module.exports = router;
