const express = require('express');
const router = express.Router();
const { submitExam, getResults, getUserResults } = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitExam);
router.get('/all', protect, admin, getResults);
router.get('/user', protect, getUserResults);

module.exports = router;
