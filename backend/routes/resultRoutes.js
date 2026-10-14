const express = require('express');
const router = express.Router();
const {
  submitExam,
  getResults,
  getUserResults,
  getResultReview,
  exportResults,
  getResultStats,
  deleteResult,
} = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitExam);
router.get('/stats', protect, admin, getResultStats);
router.get('/export', protect, admin, exportResults);
router.get('/all', protect, admin, getResults);
router.get('/user', protect, getUserResults);
router.get('/:id/review', protect, getResultReview);
router.delete('/:id', protect, admin, deleteResult);

module.exports = router;
