const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get('/exam/:examId', protect, getQuestionsByExam);
router.get('/all', protect, admin, getAllQuestions);

router.post('/', protect, admin, addQuestion);
router.post('/bulk', protect, admin, upload.single('file'), bulkAddQuestions);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);
router.post('/:id/copy', protect, admin, copyQuestionToExam);

module.exports = router;
