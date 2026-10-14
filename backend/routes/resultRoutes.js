const express = require('express');
const router = express.Router();
const { submitExam, getResults, getUserResults, deleteResult } = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitExam);
router.get('/all', protect, admin, getResults);
router.get('/user', protect, getUserResults);
router.delete('/:id', protect, admin, deleteResult);

module.exports = router;
