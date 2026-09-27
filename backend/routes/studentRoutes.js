const express = require('express');
const multer = require('multer');
const path = require('path');
const { createStudent, updateStudent, deleteStudent, getAllStudents } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.use(protect);
router.use(admin);

router.get('/', getAllStudents);
router.post('/', upload.single('profileImage'), createStudent);
router.put('/:id', upload.single('profileImage'), updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
